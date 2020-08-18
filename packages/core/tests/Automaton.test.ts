import {
    INITIAL,
    Signal,
    State,
    Automaton,
    Transition,
    transition,
    TransitionFunction,
    automaton,
} from "../src/classes/Automaton";

const STATE_A = 0;
const STATE_B = 1;
const SIGNAL_LOW = 0;
const SIGNAL_HIGH = 1;

describe('Automaton', () => {

    it('works', () => {
        const stateMachine = automaton([
            transition(INITIAL, () => STATE_A),
            transition(STATE_A, SIGNAL_LOW, STATE_A),
            transition(STATE_A, SIGNAL_HIGH, STATE_B),
            transition(STATE_B, SIGNAL_HIGH, STATE_A),
        ]);

        expect(stateMachine.constructor).toBe(Automaton);

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
        let stateMachine: Automaton;

        class CustomTransition extends Transition {
            onConditionsMet(target: Automaton): void {
                super.onConditionsMet(target);
                expect(target).toBe(stateMachine);

                log.push('met');
            }

            onConditionsUnmet(target: Automaton): void {
                super.onConditionsUnmet(target);
                expect(target).toBe(stateMachine);

                log.push('unmet');
            }
        }

        stateMachine = automaton([
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
        let stateMachine: Automaton;

        class CustomTransition extends Transition {
            constructor(
                state: State,
                signal: Signal | undefined,
                implementation: TransitionFunction
            ) {
                super(state, signal, (target: Automaton, ...args: []) => {
                    expect(target).toBe(stateMachine);
                    expect(args.join(',')).toBe('1,2,3');

                    log.push('called');
                    return typeof implementation === 'function' ? implementation() : implementation;
                });
            }
        }

        stateMachine = automaton([
            transition(INITIAL, () => STATE_A),
            new CustomTransition(STATE_A, SIGNAL_HIGH, STATE_B),
            transition(STATE_A, SIGNAL_LOW, INITIAL),
        ]);

        stateMachine.transition(SIGNAL_LOW);
        stateMachine.transition(SIGNAL_HIGH, 1, 2, 3);

        expect(log).toEqual(['called']);
    });

    it('runs multiple transitions until the first one actually changes the state', () => {
        const log: string[] = [];

        const stateMachine = automaton([
            transition(INITIAL, () => {
                log.push('transition');
                return INITIAL;
            }),
            transition(INITIAL, SIGNAL_LOW, () => {
                log.push('low');
                return INITIAL;
            }),
            transition(INITIAL, SIGNAL_HIGH, () => {
                log.push('high');
                return INITIAL;
            }),
            transition(INITIAL, SIGNAL_HIGH, () => {
                log.push('change');
                return 'first';
            }),
        ]);

        stateMachine.transition(SIGNAL_LOW);
        stateMachine.transition(SIGNAL_HIGH);
        stateMachine.transition(SIGNAL_LOW);

        expect(log).toEqual([
            'transition', 'low', 'transition', 'high', 'change',
        ]);
    });

});
