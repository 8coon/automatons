import * as React from "react";

import {mixinDecoratorFactory} from "../utils/mixinDecoratorFactory";
import {patchMethod} from "../utils/patchMethod";

import {
	Signal,
	Automaton,
	Transition,
	TransitionFunction,
} from "./Automaton";

/**
 * @ignore
 */
export interface IAutomatonComponent<P = any, S = any> extends React.Component<P, S> {
	automaton: Automaton;
	transitions: Transition[];
}

/**
 * This signal fires when the target React component is created.
 * @see [[ReactAutomaton]]
 */
export const CREATE = "create";

/**
 * This signal fires after the target React component is mounted.
 * @see [[ReactAutomaton]]
 */
export const MOUNT = "mount";

/**
 * This signal fires after the target React component is updated.
 * @see [[ReactAutomaton]]
 */
export const UPDATE = "update";

/**
 * This signal fires before the target React component is unmounted.
 * @see [[ReactAutomaton]]
 */
export const UNMOUNT = "unmount";

/**
 * This signal fires if the target React component catches error
 * @see [[ReactAutomaton]]
 * @see [[IAutomatonDecoratorParams]]
 */
export const CATCH = "catch";

/**
 * Parameters of [[withAutomaton]] decorator.
 */
export interface IAutomatonDecoratorParams {
	/**
	 * Determines whether or not [[withAutomaton]] should provide `componentDidCatch`
	 * lifecycle method.
	 */
	catching?: boolean;

	/**
	 * If set to a string, [[withAutomaton]] will call setState on every transition and
	 * set state[mapToState] to the current [[State]] value
	 */
	mapToState?: string;
}

/**
 * @ignore
 */
interface IReactEventHandlers {
	[signal: string]: React.EventHandler<any>;
}

/**
 * This class is used to extend [[Automaton]] functionality so it can be used with React components.
 *
 * [[ReactAutomaton]] always passes the host component instance to it's transition functions as
 * the first argument.
 */
export class ReactAutomaton extends Automaton {
	public mapToState: string;
	private handlers: IReactEventHandlers = {};

	constructor(private component: IAutomatonComponent) {
		super(component.transitions || /* istanbul ignore next */ []);
	}

	/**
	 * This method is used by [[asSignal]] to produce signaling event handlers.
	 *
	 * @param signal
	 */
	public signal(signal: Signal): React.EventHandler<any> {
		const key = String(signal);

		if (!this.handlers[key]) {
			this.handlers[key] = (event: React.SyntheticEvent) => {
				this.transition(signal, event);
			};
		}

		return this.handlers[key];
	}

	/**
	 * Performs a transition and calls setState if mapToState is enabled.
	 *
	 * @param signal
	 * @param args
	 */
	public transition(signal: Signal, ...args: any[]) {
		super.transition(signal, ...args);

		if (typeof this.mapToState !== "string") {
			return;
		}

		if (this.component.state[this.mapToState] !== this.state) {
			this.component.setState({
				[this.mapToState]: this.state,
			});
		}
	}

	/**
	 * Calls transition implementation, passing the host component instance.
	 *
	 * @param implementation
	 * @param args
	 */
	protected doTransition(implementation: TransitionFunction, ...args: any[]) {
		if (typeof implementation !== "function") {
			return super.doTransition(implementation);
		}

		super.doTransition(
			() => implementation(this.component, ...args), args,
		);
	}
}

/**
 * @ignore
 */
const withAutomationCallbacks = {
	onPatch<MixinBase, ResultType>(baseClass: MixinBase, params: IAutomatonDecoratorParams): void {
		const {
			catching,
		} = params;

		patchMethod(baseClass, "componentDidMount",
			function() {
				this.automaton.transition(MOUNT);
			},
		);

		patchMethod(baseClass, "componentDidUpdate",
			function(prevProps: any, prevState: any) {
				this.automaton.transition(UPDATE, prevProps, prevState);
			},
		);

		patchMethod(baseClass, "componentWillUnmount",
			function() {
				this.automaton.transition(UNMOUNT);
				this.automaton.reset();
			},
		);

		catching && patchMethod(baseClass, "componentDidCatch",
			function(error: any, errorInfo: any) {
				this.automaton.transition(CATCH, error, errorInfo);
			},
		);
	},

	onConstruct(self: IAutomatonComponent, params: IAutomatonDecoratorParams): void {
		self.automaton = new ReactAutomaton(self);
		self.automaton.transition(CREATE, self);

		if (typeof params.mapToState === "string") {
			if (!self.state) {
				self.state = {};
			}

			// Dirty hack as we're still in constructor
			(self.state as any)[params.mapToState] = self.automaton.state;

			(self.automaton as ReactAutomaton).mapToState = params.mapToState;
		}
	},
};

/**
 * React component decorator that enchants the provided class with an [[Automaton]] instance.
 *
 * [[withAutomaton]] patches some lifecycle methods of the provided component to dispatch
 * corresponding signals. The signals dispatched are:
 *
 * - [[CREATE]], dispatched from the constructor
 * - [[MOUNT]], dispatched from `componentDidMount`
 * - [[UPDATE]], dispatched from `componentDidUpdate`
 * - [[UNMOUNT]], dispatched from `componentWillUnmount`
 * - [[CATCH]], dispatched from `componentDidCatch` and if `catching` parameter is set to true:
 *
 * ```jsx
 *import {withAutomaton} from 'automatons';
 *
 *@withAutomaton({catching: true})
 *class Button extends React.Component
 * ```
 */
export const withAutomaton = mixinDecoratorFactory<
	IAutomatonComponent, IAutomatonDecoratorParams
>(withAutomationCallbacks);

/**
 * Returns the corresponding [[Automaton]] of the provided React component
 *
 * ```jsx
 *import {withAutomaton, automatonOf} from 'automatons';
 *
 *@withAutomaton
 *class Button extends React.Component {
 *    render() {
 *        return (
 *            <button onClick={() => automatonOf(this).transition('click')}/>
 *        );
 *    }
 *}
 * ```
 *
 * @param component - target component
 */
export function automatonOf(component: React.Component): ReactAutomaton {
	return (component as any).automaton;
}

/**
 * Creates an event handler callback that, on being called, dispatches a [[Signal]] on
 * corresponding React component's [[Automaton]]
 *
 * ```jsx
 *import {withAutomaton, asSignal} from 'automatons';
 *
 *@withAutomaton
 *class Button extends React.Component {
 *    render() {
 *        return (
 *            <button onClick={asSignal(this, 'click')}/>
 *        );
 *    }
 *}
 * ```
 *
 * Handler instances produced by this function are memoized internally to avoid unnecessary re-renders.
 *
 * @param component - target React component
 * @param signal - desired signal
 */
export function asSignal(component: React.Component, signal: Signal): React.EventHandler<any> {
	return automatonOf(component).signal(signal);
}
