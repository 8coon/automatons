
export type State = number | string | Symbol;
export type Signal = number | string | Symbol;
export type TransitionFunction = (...args: any) => State;

export type Transitions = Transition[];

export const INITIAL = 'initial';

export function transition(state: State, implementation: TransitionFunction): Transition
export function transition(state: State, signal: Signal, implementation: TransitionFunction): Transition
export function transition(state: State, signalOrImpl: Signal | TransitionFunction, implementation?: TransitionFunction): Transition {
	if (typeof signalOrImpl === 'function') {
		return new Transition(state, void 0, signalOrImpl as TransitionFunction);
	}

	return new Transition(state, signalOrImpl as Signal, implementation);
}

export class Transition {
	constructor(
		public state: State,
		public signal: Signal | undefined,
		public implementation: TransitionFunction
	) {}

	onConditionsMet(stateMachine: StateMachine): void {
	}

	onConditionsUnmet(stateMachine: StateMachine): void {
	}
}

export class StateMachine {
	private _state: State = INITIAL;
	private _possibleTransitions: Transition[] = [];

	constructor(private transitions: Transitions) {}

	private possibleTransitions(): Transition[] {
		return this.transitions.filter(
			_ => _.state === this._state
		);
	}

	private findTransition(signal?: Signal): Transition {
		return this.possibleTransitions().find(
			_ => _.signal === signal
		);
	}

	protected doTransition(implementation: TransitionFunction, ...args: any[]) {
		this._possibleTransitions.forEach(
			_ => _.onConditionsUnmet(this)
		);

		this._state = implementation(this, ...args);
		this._possibleTransitions = this.possibleTransitions();

		this._possibleTransitions.forEach(
			_ => _.onConditionsMet(this)
		);
	}

	public get state(): State {
		return this._state;
	}

	public transition(signal: Signal, ...args: any[]) {
		const transition = this.findTransition(signal) || this.findTransition();

		if (!transition) {
			return;
		}

		this.doTransition(transition.implementation, ...args);
	}

	public reset() {
		this.doTransition(() => INITIAL);
	}
}
