import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { OrderRequestBody } from '../../../order';
import SquareV2PaymentStrategy from './squarev2-payment-strategy';

describe('SquareV2PaymentStrategy', () => {
    let store: CheckoutStore;
    let strategy: SquareV2PaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore();

        strategy = new SquareV2PaymentStrategy(
            store
        );
    });

    describe('#initialize()', () => {
        it('initializes the strategy successfully', async () => {
            await expect(strategy.initialize()).resolves.toEqual(store.getState());
        });
    });

    describe('#execute()', () => {
        let payload: OrderRequestBody;

        beforeEach(async () => {
            payload = {
                ...getOrderRequestBody(),
                payment: {
                    methodId: 'squarev2',
                },
            };

            await strategy.initialize();
        });

        it('executes the strategy successfully', async () => {
            await expect(strategy.execute(payload)).resolves.toEqual(store.getState());
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            await expect(strategy.finalize()).rejects.toThrow(OrderFinalizationNotRequiredError);
        });
    });

    describe('#deinitialize()', () => {
        it('deinitializes strategy', async () => {
            await expect(strategy.deinitialize()).resolves.toEqual(store.getState());
        });
    });
});
