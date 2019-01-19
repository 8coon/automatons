import {State, Automaton, Transition, TransitionFunction} from "./Automaton";

class TimerTransition extends Transition {

	public static signal(ms: number) {
		return "_$timer" + ms;
	}

	private timer: any;

	constructor(
		state: State,
		implementation: TransitionFunction,
		private ms: number,
	) {
		super(state, TimerTransition.signal(ms), implementation);
	}

	public onConditionsMet(stateMachine: Automaton): void {
		super.onConditionsMet(stateMachine);
		this.timer = setTimeout(this.handleTimer.bind(this, stateMachine), this.ms);
	}

	public onConditionsUnmet(stateMachine: Automaton): void {
		super.onConditionsUnmet(stateMachine);
		clearTimeout(this.timer);
	}

	private handleTimer(stateMachine: Automaton) {
		stateMachine.transition(TimerTransition.signal(this.ms));
	}
}

export function timer(state: State, ms: number, implementation: TransitionFunction): Transition {
	return new TimerTransition(
		state,
		implementation,
		ms,
	);
}
