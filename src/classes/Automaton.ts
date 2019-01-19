
export type State = number | string | symbol;
export type Signal = number | string | symbol;
export type TransitionFunction = State | ((...args: any) => State);

export type Transitions = Transition[];

export const INITIAL = "initial";

export function transition(state: State, implementation: TransitionFunction): Transition;
export function transition(state: State, signal: Signal, implementation: TransitionFunction): Transition;
export function transition(
	state: State, signalOrImpl: Signal | TransitionFunction, implementation?: TransitionFunction,
): Transition {
	if (typeof signalOrImpl === "function") {
		return new Transition(state, void 0, signalOrImpl as TransitionFunction);
	}

	return new Transition(state, signalOrImpl as Signal, implementation);
}

export class Transition {
	constructor(
		public state: State,
		public signal: Signal | undefined,
		public implementation: TransitionFunction,
	) {}

	public onConditionsMet(stateMachine: Automaton): void {
		// Placeholder
	}

	public onConditionsUnmet(stateMachine: Automaton): void {
		// Placeholder
	}
}

export class Automaton {

	public get state(): State {
		return this.currentState;
	}

	private currentState: State = INITIAL;
	private possibleTransitions: Transition[] = [];

	constructor(private transitions: Transitions) {}

	public transition(signal: Signal, ...args: any[]) {
		const target = this.findTransition(signal) || this.findTransition();

		if (!target) {
			return;
		}

		this.doTransition(target.implementation, ...args);
	}

	public reset() {
		this.doTransition(INITIAL);
	}

	protected doTransition(implementation: TransitionFunction, ...args: any[]) {
		this.possibleTransitions.forEach(
			(_) => _.onConditionsUnmet(this),
		);

		if (typeof implementation === 'function') {
			this.currentState = implementation(this, ...args);
		} else {
			this.currentState = implementation;
		}

		this.possibleTransitions = this.getPossibleTransitions();

		this.possibleTransitions.forEach(
			(_) => _.onConditionsMet(this),
		);
	}

	private getPossibleTransitions(): Transition[] {
		return this.transitions.filter(
			(_) => _.state === this.state,
		);
	}

	private findTransition(signal?: Signal): Transition {
		return this.getPossibleTransitions().find(
			(_) => _.signal === signal,
		);
	}
}
