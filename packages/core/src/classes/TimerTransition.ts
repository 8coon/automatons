import {State, Automaton, Transition, TransitionFunction, Signal,} from "./Automaton";

/**
 * A class that implements a time-based transition.
 */
class TimerTransition extends Transition {

    /**
     * Returns [[Signal]] that is triggered when the corresponding timer fires.
     *
     * @param ms - timer value in milliseconds
     */
    public static signal(ms: number): Signal {
        return "_$timer" + ms;
    }

    /**
     * Result of `setTimeout`
     */
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

/**
 * Creates a [[Transition]] that automatically occurs in a timeout.
 *
 *```javascript
 *import {automaton, timer, INITIAL} from 'automatons'
 *
 *const stateMachine = automaton([
 *    timer(INITIAL, 1000, 'second passed'),
 *]);
 *
 *stateMachine.state === INITIAL;
 *```
 * As one second passes:
 *```javascript
 *stateMachine.state === 'second passed'
 *```
 *
 * @param state - state that makes the transition possible and starts the timer
 * @param ms - timeout in milliseconds
 * @param implementation - transition function
 */
export function timer(state: State, ms: number, implementation: TransitionFunction): Transition {
    return new TimerTransition(
        state,
        implementation,
        ms,
    );
}
