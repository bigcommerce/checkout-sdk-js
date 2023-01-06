import { createAction } from '@bigcommerce/data-store';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import { CheckoutRequestSender, CheckoutStore, createCheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { getGuestCustomer } from '../../../customer/customers.mock';
import {
    LoadPaymentMethodAction,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentMethodActionType,
    PaymentMethodRequestSender,
} from '../../../payment';
import { getStripeUPE } from '../../../payment/payment-methods.mock';
import {
    StripeHostWindow,
    StripeScriptLoader,
    StripeUPEClient,
} from '../../../payment/strategies/stripe-upe';
import {
    getShippingStripeUPEJsMock,
    getShippingStripeUPEJsMockWithAnElementCreated,
    getStripeUPEShippingInitializeOptionsMock,
} from '../../../shipping/strategies/stripe-upe/stripe-upe-shipping.mock';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ConsignmentActionType } from '../../consignment-actions';
import ConsignmentRequestSender from '../../consignment-request-sender';
import { getFlatRateOption } from '../../internal-shipping-options.mock';
import { getShippingAddress } from '../../shipping-addresses.mock';
import { ShippingInitializeOptions } from '../../shipping-request-options';

import StripeUPEShippingStrategy from './stripe-upe-shipping-strategy';

describe('StripeUPEShippingStrategy', () => {
    const requestSender = createRequestSender();

    let store: CheckoutStore;
    let consignmentActionCreator: ConsignmentActionCreator;
    let strategy: StripeUPEShippingStrategy;
    let stripeScriptLoader: StripeScriptLoader;
    let stripeUPEJsMock: StripeUPEClient;
    let loadPaymentMethodAction: Observable<LoadPaymentMethodAction>;
    let paymentMethodMock: PaymentMethod;
    let paymentMethodActionCreator: PaymentMethodActionCreator;

    beforeEach(() => {
        store = createCheckoutStore();
        paymentMethodMock = { ...getStripeUPE(), clientToken: 'myToken' };
        loadPaymentMethodAction = of(
            createAction(PaymentMethodActionType.LoadPaymentMethodSucceeded, paymentMethodMock, {
                methodId: `stripeupe?method=card`,
            }),
        );
        stripeScriptLoader = new StripeScriptLoader(createScriptLoader());
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(createRequestSender()),
            new CheckoutRequestSender(createRequestSender()),
        );
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );

        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));
        jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
            paymentMethodMock,
        );
        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
            loadPaymentMethodAction,
        );
        paymentMethodActionCreator.loadPaymentMethod = jest.fn(() => loadPaymentMethodAction);
        stripeUPEJsMock = getShippingStripeUPEJsMock();
        jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(stripeUPEJsMock);

        strategy = new StripeUPEShippingStrategy(
            store,
            stripeScriptLoader,
            consignmentActionCreator,
            paymentMethodActionCreator,
        );
    });

    describe('#initialize()', () => {
        let shippingInitialization: ShippingInitializeOptions;

        beforeEach(() => {
            shippingInitialization = getStripeUPEShippingInitializeOptionsMock();
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                getGuestCustomer,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeUPE(),
            );
        });

        afterEach(() => {
            delete (window as StripeHostWindow).bcStripeElements;
            jest.resetAllMocks();
        });

        it('loads a single instance of StripeUPEClient and StripeElements', async () => {
            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('destroys and create an instance of StripeUPEClient and StripeElements', async () => {
            stripeUPEJsMock = getShippingStripeUPEJsMockWithAnElementCreated();
            jest.spyOn(stripeScriptLoader, 'getStripeClient').mockResolvedValue(stripeUPEJsMock);

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
            expect(
                (stripeUPEJsMock.elements as jest.Mock).mock.results[0].value.getElement.mock
                    .results[0].value.destroy,
            ).toHaveBeenCalledTimes(1);
        });

        it('loads a single instance of StripeUPEClient and StripeElements when shipping data is provided', async () => {
            jest.spyOn(store.getState().shippingAddress, 'getShippingAddress').mockReturnValue(
                getShippingAddress(),
            );

            await expect(strategy.initialize(shippingInitialization)).resolves.toBe(
                store.getState(),
            );

            expect(stripeScriptLoader.getStripeClient).toHaveBeenCalledTimes(1);
            expect(stripeUPEJsMock.elements).toHaveBeenCalledTimes(1);
        });

        it('returns an error when methodId is not present', () => {
            const promise = strategy.initialize({
                ...getStripeUPEShippingInitializeOptionsMock(),
                methodId: '',
            });

            expect(promise).rejects.toBeInstanceOf(InvalidArgumentError);
        });

        it('returns an error when stripePublishableKey, or clientToken is not present', () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue({
                ...getStripeUPE(),
                initializationData: {},
            });

            const promise = strategy.initialize(shippingInitialization);

            expect(promise).rejects.toBeInstanceOf(MissingDataError);
        });
    });

    describe('#deinitialize()', () => {
        let shippingInitialization: ShippingInitializeOptions;

        beforeEach(() => {
            shippingInitialization = getStripeUPEShippingInitializeOptionsMock();
            jest.spyOn(store.getState().customer, 'getCustomerOrThrow').mockReturnValue(
                getGuestCustomer,
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(
                getStripeUPE(),
            );
            strategy.initialize(shippingInitialization);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('deinitializes strategy', async () => {
            await strategy.deinitialize();

            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });

    it('updates shipping address', async () => {
        const address = getShippingAddress();
        const options = {};
        const action = of(createAction(ConsignmentActionType.CreateConsignmentsRequested));

        jest.spyOn(consignmentActionCreator, 'updateAddress').mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith(address, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('selects shipping option', async () => {
        const method = getFlatRateOption();
        const options = {};
        const action = of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'selectShippingOption').mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(method.id, options);

        expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(
            method.id,
            options,
        );
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });
});
