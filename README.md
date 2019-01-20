# Automatons

*Automatons* is a React/JavaScript side effect management library
based on finite state machines that enables you to keep
your logic clear by describing it formally in terms of
[automata theory](https://en.wikipedia.org/wiki/Automata_theory).

## Contents
1. [The Why](#The-Why)
2. [Installation](#Installation)
3. [Getting Started](#Getting-Started)
   * 3.1. [Basic Usage](#Basic-Usage)
   * 3.2. [React Binding](#React-Binding)
   * 3.3. [Timers](#Timers)
   * 3.4. [Advanced Side Effects](#Advanced-Side-Effects)
4. [API Documentation](#API-Documentation)
5. [Contributing](#Contributing)

## The Why
View layer logic often tends to get messy, especially when dealing with
asynchronous external events from network or complex animations and user
input.

State machines help to untangle the spaghetti logic as it is described
formally as a series of states, transitions and side effects.

## Installation
* Installation: `npm i automatons`
* CDN:
   * AMD module: [https://unpkg.com/automatons@0.0.3/dist/automatons.amd.js](https://unpkg.com/automatons@0.0.2/dist/automatons.amd.js)
   * CommonJS module: [https://unpkg.com/automatons@0.0.3/dist/automatons.cjs.js](https://unpkg.com/automatons@0.0.2/dist/automatons.cjs.js)
   * EcmaScript module: [https://unpkg.com/automatons@0.0.3/dist/automatons.esm.js](https://unpkg.com/automatons@0.0.2/dist/automatons.esm.js)

## Getting Started
A state machine is an abstract mechanism that is capable of remembering
it's current state and changing it according to a pre-determined set
of rules.

*Automatons* library provides a function to construct a state machine:

```javascript
import {automaton} from "automatons";

const stateMachine = automaton([
	/* List of transition rules go here */
])
```

### Basic Usage
(See [01: Basic Usage](https://codesandbox.io/s/1z4l569x24)
on [codesandbox.io](https://codesandbox.io))

A state machine can be defined by three components:
 * a list of all possible states;
 * a list of rules to change the remembered state;
 * an initial state.

All *Automaton* state machines start in a special `INITIAL` state, reference
to which is provided by the library:

```javascript
import {INITIAL} from "automatons";
```

Transitions is *Automaton* library are triggered by external events
called *signals* and are described by `transition` function:

```javascript
import {automaton, transition, INITIAL} from "automatons";

const stateMachine = automaton([
	/**
	* Transitioning from INITIAL state to "clicked" on any signal
	*/
	transition(INITIAL, () => "clicked"),
	/**
	* Transitioning from "clicked" state back to INITIAL on "reset" signal
	*/
	transition("clicked", "reset", INITIAL),
]);

// Triggering the transition
stateMachine.transition("");
console.log(stateMachine.state); // "clicked"

// Triggering it again!
stateMachine.transition("reset");
console.log(stateMachine.state); // INITIAL
```

### React Binding
(See [02: React Binding](https://codesandbox.io/s/4r6188vp2w)
on [codesandbox.io](https://codesandbox.io))

*Automaton* library provides bindings to React to make possible the usage
of state machines in view layer logic.

You can add a state machine to any React component by applying a
`@withAutomaton` decorator:

```javascript
import {withAutomaton} from "automatons";

@withAutomaton
class Button extends React.Component {
	transitions = [
		/* List of state machine transitions */
	]
}
```

*Automaton* supports automatic state mapping and automatic component updates
with the help of `mapToState` parameter:

```javascript
import {withAutomaton} from "automatons";

@withAutomaton({
	mapToState: "phase",
})
class Button extends React.Component {
	/**
	* Now this.state.phase always refers to the current automaton state
	*/
}
```

It is also possible to automatically bind React event callbacks to automaton
signals with the help of `asSignal`:

```jsx
import {withAutomaton, asSignal} from "automatons";

@withAutomaton
class Button extends React.Component {
	render() {
		return (
			<button onClick={asSignal(this, "click")}>
				Click me!
			</button>
		);
	}
}
```

### Timers
(See [03: State Mapping & Timers](https://codesandbox.io/s/1zx21p2nr7)
on [codesandbox.io](https://codesandbox.io))

One of the most prominent features of *Automatons* is the ability to perform
transitions automatically after a timeout:

```javascript
import {automaton, timer, INITIAL} from "automatons";

const stateMachine = automaton([
	/**
	* Transitioning from INITIAL state to "ready" in 100 milliseconds
	*/
	timer(INITIAL, 100, "ready"),
	/**
	* Transitioning from "ready" state to "sleeping" in 4 seconds
	*/
	timer("ready", 4000, "sleeping"),
]);
```

### Advanced Side Effects
(See [04: Advanced Side Effects](https://codesandbox.io/s/jj4mo6rlv3)
on [codesandbox.io](https://codesandbox.io))

It is possible to perform a side effect that does not trigger any state
change:

```javascript
import {automaton, transition, sideEffect, INITIAL} from "automatons";

const stateMachine = automaton([
	/**
	* Side effect will be performed if in INITIAL state and "click" signal
	* is dispatched
	*/
	sideEffect(INITIAL, "click", () => {
		alert("Clicked!");
	}),
	/**
	* And that side effect does not stop the transition from INITIAL to
	* "clicked" on the same signal from happening.
	*/
	transition(INITIAL, "click", "clicked"),
]);
```

## API Documentation
For further information please refer to
[API Documentation](https://8coon.github.io/automatons/).

## Contributing
When contributing to *Automatons*, please open an issue first.

Please note the [code of conduct](CODE_OF_CONDUCT.md), it is desired to
follow it in all your interactions with the project.

### Reporting Bugs
When reporting a bug, please provide a minimal case of reproduction, which
can be:
 * a test that is broken but should not be,
 * a Codesandbox project in which the bug occurs.

### Pull Request Process
When sending a pull request, please do not forget the following:
 * resolve all conflicts with `master` branch,
 * update the README.md and/or the documentation in comments according
 to your changes,
 * ensure the documentation build is up-to-date in `docs` folder,
 * ensure the new functionality is covered by tests, and all tests pass.
