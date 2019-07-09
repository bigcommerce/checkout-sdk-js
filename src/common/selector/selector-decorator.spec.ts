import { default as selector } from './selector-decorator';

describe('SelectorDecorator', () => {
    @selector
    class Foo {
        constructor(
            private name: string
        ) {}

        serialize(message?: string): { name: string; message?: string } {
            return { name: this.name, message };
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    @selector
    class Bar {
        constructor(
            private name: string
        ) {}

        serialize(message?: string): { name: string; message?: string } {
            return { name: this.name, message };
        }
    }

    it('returns cached value if new value is same', () => {
        const foo = new Foo('foo');

        expect(foo.serialize()).toBe(foo.serialize());
        expect(foo.serialize('Hello world')).toBe(foo.serialize('Hello world'));
    });

    it('returns cached value if new value is same with different instance', () => {
        const foo = new Foo('foo');
        const foo2 = new Foo('foo');

        expect(foo.serialize()).toBe(foo2.serialize());
        expect(foo.serialize('Hello world')).toBe(foo2.serialize('Hello world'));
    });

    it('returns cached value if new value is same as old except private members', () => {
        const foo = new Foo('foo');
        const foo2 = new Foo('foo');
        const output = foo.serialize();

        (output as any).$$internalProp = 123;
        (output as any)._internalProp = 'abc';

        expect(output).toBe(foo2.serialize());
    });

    it('returns different values if instances belong to different classes', () => {
        const foo = new Foo('foo');
        const bar = new Bar('foo');

        expect(foo.serialize()).not.toBe(bar.serialize());
        expect(foo.serialize('Hello world')).not.toBe(bar.serialize('Hello world'));
    });

    it('returns new value if different to cached value', () => {
        const foo = new Foo('foo');

        expect(foo.serialize()).not.toBe(foo.serialize('Hello world'));
    });

    it('returns new value if different to cached value with different instances', () => {
        const foo = new Foo('foo');
        const foo2 = new Foo('FOO');

        expect(foo.serialize()).not.toBe(foo2.serialize());
        expect(foo.serialize()).toBe(foo.serialize());
        expect(foo2.serialize()).toBe(foo2.serialize());
    });

    it('allows object destruction', () => {
        const foo = new Foo('foo');
        const { serialize } = foo;

        expect(serialize()).toBe(serialize());
        expect(serialize()).toBe(foo.serialize());
    });

    it('returns expected value', () => {
        const foo = new Foo('foo');

        expect(foo.serialize('Hello world')).toEqual({
            message: 'Hello world',
            name: 'foo',
        });
    });
});
