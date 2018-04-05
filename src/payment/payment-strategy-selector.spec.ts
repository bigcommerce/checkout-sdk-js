import { getErrorResponse } from '../common/http-request/responses.mock';

import PaymentStrategySelector from './payment-strategy-selector';
import { DEFAULT_STATE } from './payment-strategy-state';

describe('PaymentStrategySelector', () => {
    let selector: PaymentStrategySelector;
    let state: any;

    beforeEach(() => {
        state = {
            paymentStrategy: DEFAULT_STATE,
        };
    });

    describe('#getExecuteError()', () => {
        it('returns error if unable to execute', () => {
            const executeError = getErrorResponse();

            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                errors: { executeError },
            });

            expect(selector.getExecuteError()).toEqual(executeError);
        });

        it('does not returns error if able to execute', () => {
            selector = new PaymentStrategySelector(state.paymentStrategy);

            expect(selector.getExecuteError()).toBeUndefined();
        });
    });

    describe('#getFinalizeError()', () => {
        it('returns error if unable to finalize', () => {
            const finalizeError = getErrorResponse();

            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                errors: { finalizeError },
            });

            expect(selector.getFinalizeError()).toEqual(finalizeError);
        });

        it('does not returns error if able to finalize', () => {
            selector = new PaymentStrategySelector(state.paymentStrategy);

            expect(selector.getFinalizeError()).toBeUndefined();
        });
    });

    describe('#getInitializeError()', () => {
        it('returns error if unable to initialize any method', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError()).toEqual(getErrorResponse());
        });

        it('returns error if unable to initialize specific method', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                errors: { initializeError: getErrorResponse(), initializeMethodId: 'foobar' },
            });

            expect(selector.getInitializeError('foobar')).toEqual(getErrorResponse());
            expect(selector.getInitializeError('bar')).toEqual(undefined);
        });

        it('does not return error if able to initialize', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                errors: {},
            });

            expect(selector.getInitializeError()).toEqual(undefined);
        });
    });

    describe('#isExecuting()', () => {
        it('returns true if updating address', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                statuses: { isExecuting: true },
            });

            expect(selector.isExecuting()).toEqual(true);
        });

        it('returns false if not updating address', () => {
            selector = new PaymentStrategySelector(state.paymentStrategy);

            expect(selector.isExecuting()).toEqual(false);
        });
    });

    describe('#isFinalizing()', () => {
        it('returns true if selecting option', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                statuses: { isFinalizing: true },
            });

            expect(selector.isFinalizing()).toEqual(true);
        });

        it('returns false if not selecting option', () => {
            selector = new PaymentStrategySelector(state.paymentStrategy);

            expect(selector.isFinalizing()).toEqual(false);
        });
    });

    describe('#isInitializing()', () => {
        it('returns true if initializing any method', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing()).toEqual(true);
        });

        it('returns true if initializing specific method', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                statuses: { initializeMethodId: 'foobar', isInitializing: true },
            });

            expect(selector.isInitializing('foobar')).toEqual(true);
            expect(selector.isInitializing('bar')).toEqual(false);
        });

        it('returns false if not initializing method', () => {
            selector = new PaymentStrategySelector({
                ...state.paymentStrategy,
                statuses: { initializeMethodId: undefined, isInitializing: false },
            });

            expect(selector.isInitializing()).toEqual(false);
        });
    });
});
