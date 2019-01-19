import * as React from "react";

import {Signal, StateMachine, Transition, TransitionFunction, Transitions} from "./StateMachine";
import {mixinDecoratorFactory} from "../utils/mixinDecoratorFactory";
import {patchMethod} from "../utils/patchMethod";

export interface AutomatonComponent<P = any, S = any> extends React.Component<P, S> {
	automaton: StateMachine;
	transitions: Transition[];
}

export const CREATE = 'create';
export const MOUNT = 'mount';
export const UPDATE = 'update';
export const UNMOUNT = 'unmount';
export const CATCH = 'catch';

export interface AutomatonDecoratorParams {
	catching?: boolean;
}

interface ReactEventHandlers {
	[signal: string]: React.EventHandler<any>;
}

export class ReactStateMachine extends StateMachine {
	private handlers: ReactEventHandlers = {};

	constructor(private component: AutomatonComponent) {
		super(component.transitions || /* istanbul ignore next */ []);
	}

	protected doTransition(implementation: TransitionFunction, ...args: any[]) {
		super.doTransition(
			() => implementation(this.component, ...args), args
		);
	}

	public signal(signal: Signal): React.EventHandler<any> {
		const key = String(signal);

		if (!this.handlers[key]) {
			this.handlers[key] = (event: React.SyntheticEvent) => {
				this.transition(signal, event);
			}
		}

		return this.handlers[key];
	}
}

export const withAutomaton = mixinDecoratorFactory<
	AutomatonComponent, AutomatonDecoratorParams
>({
	onPatch<MixinBase, ResultType>(baseClass: MixinBase, params: AutomatonDecoratorParams): void {
		const {
			catching,
		} = params;

		patchMethod(baseClass, 'componentDidMount',
			function () {
				this.automaton.transition(MOUNT);
			}
		);

		patchMethod(baseClass, 'componentDidUpdate',
			function (prevProps: any, prevState: any) {
				this.automaton.transition(UPDATE, prevProps, prevState);
			}
		);

		patchMethod(baseClass, 'componentWillUnmount',
			function () {
				this.automaton.transition(UNMOUNT);
				this.automaton.reset();
			}
		);

		catching && patchMethod(baseClass, 'componentDidCatch',
			function (error: any, errorInfo: any) {
				this.automaton.transition(CATCH, error, errorInfo);
			}
		);
	},

	onConstruct(_this: AutomatonComponent): void {
		_this.automaton = new ReactStateMachine(_this);
		_this.automaton.transition(CREATE, _this);
	}
});

export function automatonOf(component: React.Component): ReactStateMachine {
	return (component as any).automaton;
}

export function asSignal(component: React.Component, signal: Signal): React.EventHandler<any> {
	return automatonOf(component).signal(signal);
}
