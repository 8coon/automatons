import {
	INITIAL, Signal, State,
	StateMachine, Transition,
	transition, TransitionFunction,
} from "../src/classes/StateMachine";

const STATE_A = 0;
const STATE_B = 1;
const SIGNAL_LOW = 0;
const SIGNAL_HIGH = 1;

describe('StateMachine', () => {

	it('works', () => {
		const stateMachine = new StateMachine([
			transition(INITIAL, () => STATE_A),
			transition(STATE_A, SIGNAL_LOW, STATE_A),
			transition(STATE_A, SIGNAL_HIGH, STATE_B),
			transition(STATE_B, SIGNAL_HIGH, STATE_A),
		]);

		expect(stateMachine.constructor).toBe(StateMachine);

		expect(stateMachine.state).toBe(INITIAL);
		stateMachine.transition(SIGNAL_LOW);
		expect(stateMachine.state).toBe(STATE_A);
		stateMachine.transition(SIGNAL_LOW);
		expect(stateMachine.state).toBe(STATE_A);
		stateMachine.transition(SIGNAL_HIGH);
		expect(stateMachine.state).toBe(STATE_B);
		stateMachine.transition(SIGNAL_LOW);
		expect(stateMachine.state).toBe(STATE_B);
		stateMachine.transition(SIGNAL_HIGH);
		expect(stateMachine.state).toBe(STATE_A);
		stateMachine.reset();
		expect(stateMachine.state).toBe(INITIAL);
	});

	it('supports lifecycle methods', () => {
		const log = [];
		let stateMachine: StateMachine;

		class CustomTransition extends Transition {
			onConditionsMet(target: StateMachine): void {
				super.onConditionsMet(target);
				expect(target).toBe(stateMachine);

				log.push('met');
			}

			onConditionsUnmet(target: StateMachine): void {
				super.onConditionsUnmet(target);
				expect(target).toBe(stateMachine);

				log.push('unmet');
			}
		}

		stateMachine = new StateMachine([
			transition(INITIAL, () => STATE_A),
			new CustomTransition(STATE_A, SIGNAL_HIGH, STATE_B),
			transition(STATE_A, SIGNAL_LOW, INITIAL),
		]);

		stateMachine.transition(SIGNAL_LOW);
		log.push('possible');
		stateMachine.transition(SIGNAL_LOW);
		log.push('impossible');
		stateMachine.transition(SIGNAL_LOW);
		log.push('possible');
		stateMachine.reset();
		log.push('impossible');
		expect(stateMachine.state).toBe(INITIAL);

		expect(log).toEqual([
			'met', 'possible', 'unmet', 'impossible', 'met', 'possible', 'unmet', 'impossible'
		]);
	});

	it('supports transition arguments', () => {
		const log: string[] = [];
		let stateMachine: StateMachine;

		class CustomTransition extends Transition {
			constructor(
				state: State,
				signal: Signal | undefined,
				implementation: TransitionFunction
			) {
				super(state, signal, (target: StateMachine, ...args: []) => {
					expect(target).toBe(stateMachine);
					expect(args.join(',')).toBe('1,2,3');

					log.push('called');
					return typeof implementation === 'function' ? implementation() : implementation;
				});
			}
		}

		stateMachine = new StateMachine([
			transition(INITIAL, () => STATE_A),
			new CustomTransition(STATE_A, SIGNAL_HIGH, STATE_B),
			transition(STATE_A, SIGNAL_LOW, INITIAL),
		]);

		stateMachine.transition(SIGNAL_LOW);
		stateMachine.transition(SIGNAL_HIGH, 1, 2, 3);

		expect(log).toEqual(['called']);
	});

});
