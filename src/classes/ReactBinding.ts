import * as React from "react";

import {mixinDecoratorFactory} from "../utils/mixinDecoratorFactory";
import {patchMethod} from "../utils/patchMethod";

import {
	Signal,
	Automaton,
	Transition,
	TransitionFunction,
} from "./Automaton";

export interface IAutomatonComponent<P = any, S = any> extends React.Component<P, S> {
	automaton: Automaton;
	transitions: Transition[];
}

export const CREATE = "create";
export const MOUNT = "mount";
export const UPDATE = "update";
export const UNMOUNT = "unmount";
export const CATCH = "catch";

export interface IAutomatonDecoratorParams {
	catching?: boolean;
}

interface IReactEventHandlers {
	[signal: string]: React.EventHandler<any>;
}

export class ReactAutomaton extends Automaton {
	private handlers: IReactEventHandlers = {};

	constructor(private component: IAutomatonComponent) {
		super(component.transitions || /* istanbul ignore next */ []);
	}

	public signal(signal: Signal): React.EventHandler<any> {
		const key = String(signal);

		if (!this.handlers[key]) {
			this.handlers[key] = (event: React.SyntheticEvent) => {
				this.transition(signal, event);
			};
		}

		return this.handlers[key];
	}

	protected doTransition(implementation: TransitionFunction, ...args: any[]) {
		if (typeof implementation !== 'function') {
			return super.doTransition(implementation);
		}

		super.doTransition(
			() => implementation(this.component, ...args), args,
		);
	}
}

export const withAutomaton = mixinDecoratorFactory<
	IAutomatonComponent, IAutomatonDecoratorParams
>({
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

	onConstruct(self: IAutomatonComponent): void {
		self.automaton = new ReactAutomaton(self);
		self.automaton.transition(CREATE, self);
	},
});

/**
 * Returns the
 * @param component
 */
export function automatonOf(component: React.Component): ReactAutomaton {
	return (component as any).automaton;
}

export function asSignal(component: React.Component, signal: Signal): React.EventHandler<any> {
	return automatonOf(component).signal(signal);
}
