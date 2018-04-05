import { InvalidArgumentError } from '../error/errors';

import Registry from './registry';

describe('Registry', () => {
    it('returns registered instance', () => {
        const registry = new Registry<{ name: string }>();

        registry.register('foo', () => ({ name: 'Foo' }));
        registry.register('bar', () => ({ name: 'Bar' }));

        expect(registry.get('foo')).toEqual({ name: 'Foo' });
        expect(registry.get('bar')).toEqual({ name: 'Bar' });
    });

    it('returns cached instance', () => {
        const registry = new Registry();

        registry.register('foo', () => ({ name: 'Foo' }));

        expect(registry.get('foo')).toBe(registry.get('foo'));
    });

    it('returns unique cached instances', () => {
        const registry = new Registry();

        registry.register('foo', () => ({ name: 'Foo' }));

        const instanceA = registry.get('foo', 'A');
        const instanceB = registry.get('foo', 'B');

        expect(instanceA).not.toBe(instanceB);
        expect(instanceA).toEqual(instanceB);
    });

    it('returns default strategy if none found', () => {
        const registry = new Registry();

        registry.register('default', () => ({ name: 'bar' }));

        expect(registry.get('foo')).toEqual({ name: 'bar' });
    });

    it('returns default strategy if key not provided', () => {
        const registry = new Registry();

        registry.register('default', () => ({ name: 'bar' }));

        expect(registry.get()).toEqual({ name: 'bar' });
    });

    it('throws error if not able to return instance', () => {
        const registry = new Registry();

        expect(() => registry.get('foo')).toThrow(InvalidArgumentError);
    });

    it('throws error if already registered', () => {
        const registry = new Registry();

        registry.register('foo', () => ({ name: 'Foo' }));

        expect(() => registry.register('foo', () => ({ name: 'Foo' }))).toThrow(InvalidArgumentError);
    });
});
