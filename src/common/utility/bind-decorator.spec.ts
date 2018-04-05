import { default as bind } from './bind-decorator';

describe('bindDecorator()', () => {
    @bind
    class Foo {
        constructor(
            private name: string
        ) {}

        getName(): string {
            return this.name;
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class Bar {
        constructor(
            private name: string
        ) {}

        @bind
        getName(): string {
            return this.name;
        }
    }

    it('binds all methods of class to instance', () => {
        const { getName } = new Foo('foo');

        expect(getName()).toEqual('foo');
    });

    it('binds method to instance', () => {
        const { getName } = new Bar('bar');

        expect(getName()).toEqual('bar');
    });
});
