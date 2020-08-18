
/**
 * State type.
 */
export type State = number | string | symbol;

/**
 * Signal type.
 */
export type Signal = number | string | symbol;

/**
 * The resulting state of a transition or a function returning one.
 */
export type TransitionFunction = State | ((...args: any) => State);

/**
 * A list of transitions.
 */
export type Transitions = Transition[];

/**
 * Initial state of [[Automaton]]
 */
export const INITIAL: State = "initial";

/**
 * This function constructs a desired [[Transition]] from provided [[State]], [[Signal]] and implementation.
 *
 * If no signal provided, this function constructs an unconditional transition, which is triggered
 * by any signal.
 *
 * @param state
 * @param implementation
 */
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

/**
 * This class holds the information nesessary to perform a state machine transition.
 *
 * You can extend this class to implement some custom logic.
 */
export class Transition {
	/**
	 * @param state - state from which the transition is possible
	 * @param signal - signal, that triggers the transition, or `undefined` if it is an unconditional transition
	 * @param implementation - the next state or a function that returns one
	 */
	constructor(
		public state: State,
		public signal: Signal | undefined,
		public implementation: TransitionFunction,
	) {}

	/**
	 * This lifecycle method is triggered when all conditions are met to perform a transition.
	 * @param stateMachine
	 */
	public onConditionsMet(stateMachine: Automaton): void {
		// Placeholder
	}

	/**
	 * This lifecycle method is triggered when conditions to perform a transition are no longer met
	 */
	public onConditionsUnmet(stateMachine: Automaton): void {
		// Placeholder
	}
}

/**
 * The main automaton class, holds the state and provides methods for transitioning.
 *
 * The state defaults to [[INITIAL]].
 *
 * You can extend this class to implement some custom logic.
 */
export class Automaton {

	/**
	 * Current state of the [[Automaton]].
	 */
	public get state(): State {
		return this.currentState;
	}

	/**
	 * @ignore
	 */
	private currentState: State = INITIAL;

	/**
	 * Holds a list of transitions that are possible to perform from the current state.
	 */
	private possibleTransitions: Transition[] = [];

	constructor(private transitions: Transitions) {}

	/**
	 * Performs a state machine transition, dispatching a [[Signal]].
	 *
	 * @param signal - target signal
	 * @param args - custom arguments passed to the transition function
	 */
	public transition(signal: Signal, ...args: any[]) {
		const transitions = this.findTransitions(signal);
		const prevState = this.state;

		for (const target of transitions) {
			this.doTransition(target.implementation, ...args);

			// The first transition to change state is the last one
			if (prevState !== this.state) {
				return;
			}
		}
	}

	/**
	 * Resets [[Automaton]] state back to [[INITIAL]].
	 */
	public reset() {
		this.doTransition(INITIAL);
	}

	/**
	 * Performs a [[Transition]], calling it's lifecycle methods.
	 *
	 * @param implementation - transition function or next finite machine state
	 * @param args - custom arguments passed to the implementation function
	 */
	protected doTransition(implementation: TransitionFunction, ...args: any[]) {
		this.possibleTransitions.forEach(
			(_) => _.onConditionsUnmet(this),
		);

		if (typeof implementation === "function") {
			this.currentState = implementation(this, ...args);
		} else {
			this.currentState = implementation;
		}

		this.possibleTransitions = this.getPossibleTransitions();

		this.possibleTransitions.forEach(
			(_) => _.onConditionsMet(this),
		);
	}

	/**
	 * Gets the list of all transitions that are possible to perform from the current state.
	 */
	private getPossibleTransitions(): Transition[] {
		return this.transitions.filter(
			(_) => _.state === this.state,
		);
	}

	/**
	 * Returns the transition that satisfies the following conditions:
	 * - It is possible to perform from the current state
	 * - It can be performed by the provided [[Signal]]
	 *
	 * @param signal
	 */
	private findTransitions(signal?: Signal): Transition[] {
		return this.getPossibleTransitions().filter(
			(_) => (_.signal === signal || _.signal === void 0),
		);
	}
}

/**
 * Function that constructs an [[Automaton]] from the provided transition list.
 *
 *```javascript
 *import {automaton, transition, INITIAL} from 'automatons'
 *
 *const stateMachine = automaton([
 *    transition(INITIAL, 'ready'),
 *    transition('ready', 'toggle', 'showing'),
 *    transition('showing', 'toggle', 'ready'),
 *]);
 *
 *stateMachine.state === INITIAL;
 *
 *stateMachine.transition('any signal');
 *stateMachine.state === 'ready';
 *
 *stateMachine.transition('toggle');
 *stateMachine.state === 'showing';
 *
 *stateMachine.transition('toggle');
 *stateMachine.state === 'ready';
 *```
 *
 * @param transitions
 */
export function automaton(transitions: Transitions): Automaton {
	return new Automaton(transitions);
}
