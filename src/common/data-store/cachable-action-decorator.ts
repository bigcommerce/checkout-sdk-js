import cacheAction from './cache-action';
import isActionOptions from './is-action-options';

export default function cachableActionDecorator<TMethod extends (...args: any[]) => any>(
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<TMethod>
): TypedPropertyDescriptor<TMethod> {
    const memoizedMethods = new WeakMap<object, { [key: string]: TMethod }>();

    function decorateMethod(this: object, method: TMethod): TMethod {
        return ((...args: any[]) => {
            const lastArg = args[args.length - 1];
            const { useCache } = isActionOptions(lastArg) ? lastArg : { useCache: false };

            if (!useCache) {
                return method.call(this, ...args);
            }

            const instanceMethods = memoizedMethods.get(this) || {};

            if (!memoizedMethods.get(this)) {
                memoizedMethods.set(this, instanceMethods);
            }

            if (!instanceMethods[key]) {
                instanceMethods[key] = cacheAction(method);
            }

            return instanceMethods[key].call(this, ...args);
        }) as TMethod;
    }

    return {
        get() {
            if (typeof descriptor.value !== 'function') {
                return descriptor.value;
            }

            const value = decorateMethod.call(this, descriptor.value);

            Object.defineProperty(this, key, { ...descriptor, value });

            return value;
        },
    };
}
