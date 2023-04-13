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

    it('returns correct strategy for a entered registry', () => {
        const subject = new ResolveIdRegistry(true);
        const registryKey1 = { id: 'credit_card', gateway: 'bluesnap' };
        const registryKey2 = { type: 'PAYMENT_TYPE_HOSTED' };

        subject.register(registryKey1, () => new StrategyA());
        subject.register(registryKey2, () => new BarStrategy());

        const query = { id: 'credit_card', gateway: 'barclaycard', type: 'PAYMENT_TYPE_HOSTED' };

        expect(subject.get(query)).toBeInstanceOf(BarStrategy);
    });

    it('returns correct strategy for a entered registry if gateway passed is null', () => {
        const subject = new ResolveIdRegistry(true);
        const registryKey1 = { id: 'credit_card', gateway: 'bluesnap' };
        const registryKey2 = { id: 'credit_card' };

        subject.register(registryKey1, () => new StrategyA());
        subject.register(registryKey2, () => new BarStrategy());

        const query = { id: 'credit_card', gateway: null, type: 'PAYMENT_TYPE_HOSTED' };

        expect(subject.get(query)).toBeInstanceOf(BarStrategy);
    });

    it('returns correct strategy for a entered registry when entry is with type', () => {
        const subject = new ResolveIdRegistry(true);
        const registryKey1 = { id: 'credit_card', gateway: 'bluesnap' };
        const registryKey2 = { id: 'card', gateway: 'barclaycard' };
        const registryKey3 = { type: 'PAYMENT_TYPE_HOSTED' };

        subject.register(registryKey1, () => new StrategyA());
        subject.register(registryKey2, () => new BarStrategy());
        subject.register(registryKey3, () => new FooStrategy());

        const query = { id: 'credit_card', gateway: 'barclaycard', type: 'PAYMENT_TYPE_HOSTED' };

        expect(subject.get(query)).toBeInstanceOf(FooStrategy);
    });

    it('throws an error if two matches are returned with same weight', () => {
        const subject = new ResolveIdRegistry(true);
        const registryKey1 = { id: 'credit_card' };
        const registryKey2 = { type: 'PAYMENT_TYPE_HOSTED' };

        subject.register(registryKey1, () => new StrategyA());
        subject.register(registryKey2, () => new BarStrategy());

        const query = { id: 'credit_card', gateway: 'barclaycard', type: 'PAYMENT_TYPE_HOSTED' };

        expect(() => subject.get(query)).toThrow();
    });
});
