import {INITIAL, StateMachine, transition} from "../src/classes/StateMachine";
import {timer} from "../src/classes/TimerTransition";

const STATE_A = 0;
const STATE_B = 1;
const SIGNAL_LOW = 0;
const SIGNAL_HIGH = 1;

describe('TimerTransition', () => {

	it('works', async () => {
		const stateMachine = new StateMachine([
			transition(INITIAL, () => STATE_A),
			timer(STATE_A, 10, () => STATE_B),
			transition(STATE_B, SIGNAL_LOW, () => STATE_A),
		]);

		stateMachine.transition(SIGNAL_LOW);

		await new Promise(_ => setTimeout(_, 30));
		expect(stateMachine.state).toBe(STATE_B);
		stateMachine.transition(SIGNAL_LOW);
		expect(stateMachine.state).toBe(STATE_A);
		await new Promise(_ => setTimeout(_, 30));
		expect(stateMachine.state).toBe(STATE_B);
	});

	it('works with cancellation', async () => {
		const stateMachine = new StateMachine([
			transition(INITIAL, () => STATE_A),
			timer(STATE_A, 10, () => STATE_B),
			transition(STATE_A, SIGNAL_HIGH, () => INITIAL),
		]);

		stateMachine.transition(SIGNAL_LOW);
		expect(stateMachine.state).toBe(STATE_A);
		stateMachine.transition(SIGNAL_LOW);
		expect(stateMachine.state).toBe(STATE_A);
		await new Promise(_ => setTimeout(_, 5));
		expect(stateMachine.state).toBe(STATE_A);
		stateMachine.transition(SIGNAL_HIGH);
		expect(stateMachine.state).toBe(INITIAL);
		await new Promise(_ => setTimeout(_, 40));
		expect(stateMachine.state).toBe(INITIAL);
	});

});
