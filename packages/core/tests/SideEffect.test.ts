import {automaton, INITIAL} from "../src";
import {sideEffect} from "../src/classes/SideEffect";
import {transition} from "../src/classes/Automaton";

const SIGNAL_LOW = 0;
const SIGNAL_HIGH = 1;

describe('SideEffect', () => {

	it('works', () => {
		const log: string[] = [];

		const stateMachine = automaton([
			sideEffect(INITIAL, SIGNAL_LOW, () => {
				log.push('low');
			}),
			sideEffect(INITIAL, SIGNAL_HIGH, () => {
				log.push('high');
			}),
			sideEffect(INITIAL, () => {
				log.push('on initial');
			}),
			transition(INITIAL, SIGNAL_HIGH, 'first'),
			sideEffect('first', () => {
				log.push('on first');
			})
		]);

		stateMachine.transition(SIGNAL_LOW);
		stateMachine.transition(SIGNAL_HIGH);
		stateMachine.transition(SIGNAL_HIGH);

		expect(log).toEqual([
			'low', 'on initial', 'high', 'on initial', 'on first'
		]);
	})

});
