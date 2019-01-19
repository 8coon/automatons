import {State, StateMachine, Transition, TransitionFunction} from "./StateMachine";

class TimerTransition extends Transition {

	public static signal(ms: number) {
		return '_$timer' + ms;
	}

	private timer: any;

	constructor(
		state: State,
		implementation: TransitionFunction,
		private ms: number,
	) {
		super(state, TimerTransition.signal(ms), implementation);
	}

	private handleTimer(stateMachine: StateMachine) {
		stateMachine.transition(TimerTransition.signal(this.ms));
	}

	onConditionsMet(stateMachine: StateMachine): void {
		super.onConditionsMet(stateMachine);
		this.timer = setTimeout(this.handleTimer.bind(this, stateMachine), this.ms);
	}

	onConditionsUnmet(stateMachine: StateMachine): void {
		super.onConditionsUnmet(stateMachine);
		clearTimeout(this.timer);
	}
}

export function timer(state: State, ms: number, implementation: TransitionFunction): Transition {
	return new TimerTransition(
		state,
		implementation,
		ms,
	);
}
