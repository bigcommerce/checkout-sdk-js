import { createAction, Action } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { omit } from 'lodash';
import { of, Observable } from 'rxjs';

import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { OrderActionCreator, OrderActionType, OrderRequestSender } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getOrderRequestBody } from '../../../order/internal-orders.mock';
import { createSpamProtection, SpamProtectionActionCreator } from '../../../order/spam-protection';

import NoPaymentDataRequiredPaymentStrategy from './no-payment-data-required-strategy';

describe('NoPaymentDataRequiredPaymentStrategy', () => {
    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let submitOrderAction: Observable<Action>;
    let noPaymentDataRequiredPaymentStrategy: NoPaymentDataRequiredPaymentStrategy;

    beforeEach(() => {
        store = createCheckoutStore();
        orderActionCreator = new OrderActionCreator(
            new OrderRequestSender(createRequestSender()),
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender())),
            new SpamProtectionActionCreator(createSpamProtection(createScriptLoader()))
        );
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));

        jest.spyOn(orderActionCreator, 'submitOrder')
            .mockReturnValue(submitOrderAction);

        jest.spyOn(store, 'dispatch');

        noPaymentDataRequiredPaymentStrategy = new NoPaymentDataRequiredPaymentStrategy(store, orderActionCreator);
    });

    describe('#execute()', () => {
        it('calls submit order with the right data', async () => {
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), undefined);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(omit(getOrderRequestBody(), 'payment'), undefined);
            expect(store.dispatch).toHaveBeenCalledWith(submitOrderAction);
        });

        it('passes the options to submitOrder', async () => {
            const options = { myOptions: 'option1', methodId: 'testgateway' };
            await noPaymentDataRequiredPaymentStrategy.execute(getOrderRequestBody(), options);

            expect(orderActionCreator.submitOrder).toHaveBeenCalledWith(expect.any(Object), options);
        });
    });

    describe('#finalize()', () => {
        it('throws error to inform that order finalization is not required', async () => {
            try {
                await noPaymentDataRequiredPaymentStrategy.finalize();
            } catch (error) {
                expect(error).toBeInstanceOf(OrderFinalizationNotRequiredError);
            }
        });
    });
});
