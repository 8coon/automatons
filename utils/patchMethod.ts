
export function patchMethod<T>(constructor: T, name: string, implementation: (...args: any) => any) {
	const originalImpl = (constructor as any).prototype[name];
	const implemented = typeof originalImpl === 'function';

	(constructor as any).prototype[name] = function automatonPatchedMethod() {
		implementation.apply(this, arguments);

		if (implemented) {
			return originalImpl.apply(this, arguments);
		}
	}
}
