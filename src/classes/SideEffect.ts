import {Signal, State, Transition} from "./Automaton";

/**
 * Side effect implementation function.
 */
type SideEffectImplementation = ((...args: any) => void);

/**
 * Class that represents a special side effect transition.
 */
class SideEffect extends Transition {
	constructor(
		state: State,
		signal: Signal | undefined,
		implementation: SideEffectImplementation,
	) {
		super(state, signal, (...args: any[]) => {
			implementation(...args);
			return state;
		});
	}
}

/**
 * Creates a [[SideEffect]] that is an empty transition returning the previous state.
 *
 * @param state - target state
 * @param implementation - side effect function
 */
export function sideEffect(state: State, implementation: SideEffectImplementation): SideEffect;
export function sideEffect(state: State, signal: Signal, implementation: SideEffectImplementation): SideEffect;
export function sideEffect(
	state: State,
	signalOrImpl: Signal | SideEffectImplementation,
	implementation?: SideEffectImplementation,
): SideEffect {
	if (typeof signalOrImpl === "function") {
		implementation = signalOrImpl;
		signalOrImpl = void 0;
	}

	return new SideEffect(
		state,
		signalOrImpl as Signal,
		implementation,
	);
}
