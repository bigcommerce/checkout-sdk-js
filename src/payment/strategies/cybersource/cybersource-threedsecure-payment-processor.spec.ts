import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore, CheckoutValidator } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import MissingDataError from '../../../common/error/errors/missing-data-error';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { OrderActionCreator, OrderRequestSender } from '../../../order';
import { PaymentRequestSender } from '../../index';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { getCybersource, getPaymentMethodsState } from '../../payment-methods.mock';

import {CardinalValidatedAction, CardinalValidatedData, CyberSourceCardinal, Payment} from './cybersource';
import CyberSourceScriptLoader from './cybersource-script-loader';
import CyberSourceThreeDSecurePaymentProcessor from './cybersource-threedsecure-payment-processor';
import {getCardinalValidatedDataWithSetupError, getCybersourceCardinal} from './cybersource.mock';
import { CardinalEventType } from './index';

describe('CyberSourceThreeDSecurePaymentProcessor', () => {
    let processor: CyberSourceThreeDSecurePaymentProcessor;
    let cybersourceScriptLoader: CyberSourceScriptLoader;
    let store: CheckoutStore;
    let _paymentActionCreator: PaymentActionCreator;
    let _orderActionCreator: OrderActionCreator;
    let paymentMethodMock: PaymentMethod;
    let _orderRequestSender: OrderRequestSender;
    let cardinal: CyberSourceCardinal;

    beforeEach(() => {
        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        _orderRequestSender = new OrderRequestSender(createRequestSender());

        _orderActionCreator = new OrderActionCreator(
            _orderRequestSender,
            new CheckoutValidator(new CheckoutRequestSender(createRequestSender()))
        );

        _paymentActionCreator = new PaymentActionCreator(
            new PaymentRequestSender(createPaymentClient()),
            _orderActionCreator
        );

        cybersourceScriptLoader = new CyberSourceScriptLoader(createScriptLoader());

        jest.spyOn(store, 'dispatch')
            .mockResolvedValue(store.getState());
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod')
            .mockReturnValue(paymentMethodMock);

        processor =  new CyberSourceThreeDSecurePaymentProcessor(
            store,
            _orderActionCreator,
            _paymentActionCreator,
            cybersourceScriptLoader
        );
    });

    describe('#initialize', () => {
        beforeEach(() => {
            paymentMethodMock = getCybersource();
            cardinal = getCybersourceCardinal();

            jest.spyOn(cybersourceScriptLoader, 'load')
                .mockReturnValue(Promise.resolve(cardinal));
        });

        it('initializes successfully', async () => {
            let call: () => {};

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.SetupCompleted) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                call();
            });

            const promise = await processor.initialize(paymentMethodMock);

            expect(cardinal.on).toHaveBeenCalledWith(CardinalEventType.SetupCompleted, expect.any(Function));
            expect(promise).toBe(store.getState());
        });

        it('initializes incorrectly', async () => {
            let call: (data: CardinalValidatedData, jwt: string) => {};

            cardinal.on = jest.fn((type, callback) => {
                if (type.toString() === CardinalEventType.Validated) {
                    call = callback;
                } else {
                    jest.fn();
                }
            });

            jest.spyOn(cardinal, 'setup').mockImplementation(() => {
                call(getCardinalValidatedDataWithSetupError(), '');
            });

            try {
                await processor.initialize(paymentMethodMock);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws when initialize options are undefined', () => {
            const paymentMethod = paymentMethodMock;
            paymentMethod.clientToken = undefined;

            expect(() => processor.initialize(paymentMethod))
                .toThrow(MissingDataError);
        });
    });
});
