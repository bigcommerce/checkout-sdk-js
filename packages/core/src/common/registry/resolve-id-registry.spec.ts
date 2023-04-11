import ResolveIdRegistry from './resolve-id-registry';

describe('ResolveIdRegistry', () => {
    interface TestStrategy {
        execute(): boolean;
    }

    interface TestResolveId {
        [key: string]: unknown;
        id?: string;
        type?: string;
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

    class DefaultStrategy implements TestStrategy {
        execute() {
            return true;
        }
    }

    class StrategyA implements TestStrategy {
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
        subject.register({ default: true }, () => new DefaultStrategy());
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

    it('throws error if unable to resolve to one when useFallback is false', () => {
        expect(() => subject.get({ type: 'hello' })).toThrow();
    });

    it('returns default strategy if unable to resolve to one when useFallback is true', () => {
        subject = new ResolveIdRegistry(true);
        subject.register({ default: true }, () => new DefaultStrategy());

        expect(subject.get({ type: 'bigbigpaypay' })).toBeInstanceOf(DefaultStrategy);
    });

    it('returns new strategy instance if multiple methods fallback to default strategy', () => {
        subject = new ResolveIdRegistry(true);
        subject.register({ default: true }, () => new DefaultStrategy());

        expect(subject.get({ type: 'bigbigpay' })).toBeInstanceOf(DefaultStrategy);
        expect(subject.get({ type: 'bigpaypay' })).toBeInstanceOf(DefaultStrategy);
        expect(subject.get({ type: 'bigbigpay' })).not.toBe(subject.get({ type: 'bigpaypay' }));
    });

    it('returns new strategy instance if multiple methods fallback to default strategy', () => {
        subject = new ResolveIdRegistry(true);
        subject.register({ default: true }, () => new DefaultStrategy());

        expect(subject.get({ type: 'bigbigpay' })).toBeInstanceOf(DefaultStrategy);
        expect(subject.get({ type: 'bigpaypay' })).toBeInstanceOf(DefaultStrategy);
        expect(subject.get({ type: 'bigbigpay' })).not.toBe(subject.get({ type: 'bigpaypay' }));
    });

    it('returns correct strategy for a entered resgistry', () => {
        const subject = new ResolveIdRegistry(true);
        const registryKey1 = { id: 'credit_card', gateway: 'bluesnap' };
        const registryKey2 = { id: 'credit_card' };

        subject.register(registryKey1, () => new StrategyA());

        expect(() => subject.get(registryKey2)).toThrow();
        expect(subject.get(registryKey1)).toBeInstanceOf(StrategyA);
    });
});
