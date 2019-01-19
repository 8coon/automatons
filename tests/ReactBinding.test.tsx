import * as React from "react";
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import {
	asSignal,
	automatonOf,
	CATCH,
	CREATE,
	MOUNT,
	UNMOUNT,
	UPDATE,
	withAutomaton,
} from "../src/classes/ReactBinding";

import {
	INITIAL, State, Transition,
	transition,
} from "../src/classes/Automaton";

import {timer} from "../src";

Enzyme.configure({adapter: new Adapter()});

interface SignalsType {
	[key: string]: string;
}

const Signals: SignalsType = {
	[CREATE]: 'create',
	[MOUNT]: 'mount',
	[UPDATE]: 'update',
	[UNMOUNT]: 'unmount',
	[CATCH]: 'catch',
};

function createTestComponent(
	transitions: Transition[],
	initial: State,
	log: string[],
	catching = false,
): any {
	return (catching ? withAutomaton({catching}) : withAutomaton)(
		class extends React.Component {
			transitions = [
				...transitions,

				transition(INITIAL, CREATE, () => {
					const automaton = automatonOf(this);
					const original = automaton.transition;

					automaton.transition = function () {
						log.push(Signals[arguments[0]] || String(arguments[0]));
						return original.apply(this, arguments);
					};

					log.push(Signals[CREATE]);
					return initial;
				}),
			];

			constructor(props: any) {
				super(props);
				this.state = {state: null};
			}

			componentDidMount(): void {
				log.push('originalMount');
			}

			render(): React.ReactNode {
				return (
					<div onClick={asSignal(this, 'click')}>
						{(this.state as any).state}
						{this.props.children}
					</div>
				)
			}
		}
	);
}

describe('ReactBinding', () => {

	it('supports lifecycle', () => {
		const log: string[] = [];

		const Test = createTestComponent(
			[
				transition(INITIAL, UPDATE, (...args) => {
					expect(args[0]).toBeInstanceOf(React.Component);
					expect(args[1]).toEqual({prop: 'value'});
					expect(args[2]).toEqual({state: null});

					log.push('_');
					return INITIAL
				})
			],
			INITIAL,
			log,
		);

		const component = Enzyme.shallow(<Test prop="value"/>);
		log.push('mounted');

		component.setState({updated: true});
		log.push('updated');

		component.unmount();
		log.push('unmounted');

		expect(log).toEqual([
			'create', 'mount', 'originalMount', 'mounted', 'update', '_', 'updated', 'unmount', 'unmounted',
		]);
	});

	it('supports errors', () => {
		const log: string[] = [];

		const Test = createTestComponent(
			[
				transition(INITIAL, CATCH, (...args) => {
					expect(args[0]).toBeInstanceOf(React.Component);
					expect(args[1]).toEqual(new Error('some error'));

					log.push('_');
					return INITIAL
				})
			],
			INITIAL,
			log,
			true
		);

		const Something = (_: any): any => null;

		const component = Enzyme.shallow(<Test><Something/></Test>);
		log.push('mounted');

		component.find(Something).simulateError(new Error('some error'));
		log.push('caught');

		component.unmount();
		log.push('unmounted');

		expect(log).toEqual([
			'create', 'mount', 'originalMount', 'mounted', 'catch', '_', 'caught', 'unmount', 'unmounted',
		]);
	});

	it('supports timer', async () => {
		const log: string[] = [];

		const Test = createTestComponent(
			[
				transition('ready', MOUNT, (_) => {
					_.setState({state: 'ready'});
					return 'ready';
				}),
				timer('ready', 10, (_) => {
					_.setState({state: 'sleeping'});
					return 'sleeping';
				}),
				transition('sleeping', 'click', (_) => {
					_.setState({state: 'ready'});
					return 'ready';
				}),
			],
			'ready',
			log
		);

		const component = Enzyme.shallow(<Test/>);
		expect(component.text()).toBe('ready');

		await new Promise(_ => setTimeout(_, 20));
		expect(component.text()).toBe('sleeping');

		component.simulate('click');
		expect(component.text()).toBe('ready');

		component.unmount();

		expect(log).toEqual([
			'create', 'mount', 'update', 'originalMount', '_$timer10', 'update', 'click', 'update', 'unmount',
		]);
	});

});
