import ResolveIdRegistry from './resolve-id-registry';

describe('ResolveIdRegistry', () => {
    interface TestStrategy {
        execute(): boolean;
    }

    interface TestResolveId {
        id?: string;
        type?: string;
        [key: string]: unknown;
    }

    class FooStrategy implements TestStrategy {
        execute() {
            return true;
        }
    }

    class BarStrategy implements TestStrategy {
        execute() {
            return true;
        }
    }

    class FoobarStrategy implements TestStrategy {
        execute() {
            return true;
        }
    }

    let subject: ResolveIdRegistry<TestStrategy, TestResolveId>;

    beforeEach(() => {
        subject = new ResolveIdRegistry();
        subject.register({ id: 'foo' }, () => new FooStrategy());
        subject.register({ type: 'bar' }, () => new BarStrategy());
        subject.register({ id: 'foo', type: 'bar' }, () => new FoobarStrategy());
    });

    it('returns strategy if able to resolve to one by id', () => {
        expect(subject.get({ id: 'foo' })).toBeInstanceOf(FooStrategy);
    });

    it('returns strategy if able to resolve to one by type', () => {
        expect(subject.get({ type: 'bar' })).toBeInstanceOf(BarStrategy);
    });

    it('returns strategy if able to resolve to one by id and type', () => {
        expect(subject.get({ id: 'foo', type: 'bar' })).toBeInstanceOf(FoobarStrategy);
    });

    it('throws error if unable to resolve to one', () => {
        expect(() => subject.get({ type: 'hello' })).toThrow();
    });
});
