
type Ctor<T = {}> = new(...args: any[]) => T;

interface MixinDecoratorCallbacks<MixinInterface, MixinParameters> {
	onPatch<MixinBase, ResultType>(baseClass: MixinBase, params: MixinParameters): void;
	onConstruct(baseClassInstance: any): void;
}

export function mixinDecoratorFactory<MixinInterface, MixinParameters>(
	callbacks: MixinDecoratorCallbacks<MixinInterface, MixinParameters>,
) {
	const decoratorFactory = function(mixinParams: MixinParameters | any): any {
		// When used without parameters
		if (typeof mixinParams === "function") {
			return decoratorFactory({})(mixinParams);
		}

		return function<MixinBase extends Ctor>(MixinBase: MixinBase) {

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
