
type Ctor<T = {}> = new(...args: any[]) => T;

interface IMixinDecoratorCallbacks<MixinInterface, MixinParameters> {
	onPatch<MixinBase, ResultType>(baseClass: MixinBase, params: MixinParameters): void;
	onConstruct(baseClassInstance: any): void;
}

export function mixinDecoratorFactory<MixinInterface, MixinParameters>(
	callbacks: IMixinDecoratorCallbacks<MixinInterface, MixinParameters>,
) {
	const decoratorFactory = (mixinParams: MixinParameters | any): any => {
		// When used without parameters
		if (typeof mixinParams === "function") {
			return decoratorFactory({})(mixinParams);
		}

		return <MixinBase extends Ctor>(MixinBase: MixinBase) => {

			type ResultType = MixinBase & Ctor<MixinInterface>;

			const Result = class extends MixinBase {
				/* istanbul ignore next */
				constructor(...args: any[]) {
					super(...args);

					callbacks.onConstruct(this as any);
				}

			} as ResultType;

			callbacks.onPatch<MixinBase, ResultType>(Result, mixinParams);

			return Result;
		};
	};

	return decoratorFactory;
}
