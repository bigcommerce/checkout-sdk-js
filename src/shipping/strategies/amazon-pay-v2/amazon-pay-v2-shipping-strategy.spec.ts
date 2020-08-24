import { createAction } from '@bigcommerce/data-store';
import { createFormPoster, FormPoster } from '@bigcommerce/form-poster';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { of } from 'rxjs';

import { createShippingStrategyRegistry, ConsignmentActionCreator, ConsignmentActionType, ConsignmentRequestSender, ShippingStrategyActionCreator } from '../..';
import { createCheckoutStore, CheckoutRequestSender, CheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { InvalidArgumentError, MissingDataError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator, PaymentMethodRequestSender } from '../../../payment';
import { getAmazonPayV2, getPaymentMethodsState } from '../../../payment/payment-methods.mock';
import { createAmazonPayV2PaymentProcessor, AmazonPayV2PaymentProcessor } from '../../../payment/strategies/amazon-pay-v2';
import { getFlatRateOption } from '../../internal-shipping-options.mock';
import { getShippingAddress, getShippingAddressWithCustomFields } from '../../shipping-addresses.mock';
import { ShippingInitializeOptions } from '../../shipping-request-options';

import AmazonPayV2ShippingStrategy from './amazon-pay-v2-shipping-strategy';

describe('AmazonPayV2ShippingStrategy', () => {
    let amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor;
    let container: HTMLDivElement;
    let editShippingButton: HTMLDivElement;
    let formPoster: FormPoster;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let paymentMethodMock: PaymentMethod;
    let requestSender: RequestSender;
    let store: CheckoutStore;
    let consignmentActionCreator: ConsignmentActionCreator;
    let shippingStrategyActionCreator: ShippingStrategyActionCreator;
    let strategy: AmazonPayV2ShippingStrategy;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(createRequestSender()),
            new CheckoutRequestSender(createRequestSender())
        );
        shippingStrategyActionCreator = new ShippingStrategyActionCreator(
            createShippingStrategyRegistry(store, requestSender)
        );
        amazonPayV2PaymentProcessor = createAmazonPayV2PaymentProcessor();
        requestSender = createRequestSender();
        formPoster = createFormPoster();

        const paymentMethodRequestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        paymentMethodActionCreator = new PaymentMethodActionCreator(paymentMethodRequestSender);
        paymentMethodMock = getAmazonPayV2();

        container = document.createElement('div');
        container.setAttribute('id', 'container');
        document.body.appendChild(container);

        editShippingButton = document.createElement('div');
        editShippingButton.setAttribute('id', 'edit-ship-address-button');
        document.body.appendChild(editShippingButton);

        jest.spyOn(store, 'dispatch');

        jest.spyOn(amazonPayV2PaymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(amazonPayV2PaymentProcessor, 'deinitialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(amazonPayV2PaymentProcessor, 'createButton')
            .mockReturnValue(container);

        jest.spyOn(amazonPayV2PaymentProcessor, 'bindButton')
            .mockImplementation(() => {});

        jest.spyOn(formPoster, 'postForm')
            .mockImplementation((_url, _data, callback = () => {}) => callback());

        jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod')
            .mockResolvedValue(store.getState());

        strategy = new AmazonPayV2ShippingStrategy(
            store,
            consignmentActionCreator,
            paymentMethodActionCreator,
            amazonPayV2PaymentProcessor,
            shippingStrategyActionCreator
        );
    });

    afterEach(() => {
        document.body.removeChild(container);
        if (editShippingButton.parentElement === document.body) {
            document.body.removeChild(editShippingButton);
        } else {
            const shippingButton = document.getElementById('edit-ship-address-button');
            if (shippingButton) {
                document.body.removeChild(shippingButton);
            }
        }
    });

    it('creates an instance of AmazonPayV2ShippingStrategy', () => {
        expect(strategy).toBeInstanceOf(AmazonPayV2ShippingStrategy);
    });

    describe('#initialize()', () => {
        let initializeOptions: ShippingInitializeOptions;
        const paymentToken = 'abc123';
        const shippingId = 'edit-ship-address-button';

        beforeEach(() => {
            initializeOptions = {
                methodId: 'amazonpay',
                amazonpay: {
                    editAddressButtonId: shippingId,
                },
            };
        });

        it('dispatches update shipping when clicking previously binded buttons', async () => {
            jest.spyOn(shippingStrategyActionCreator, 'widgetInteraction');
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            const editButton = document.getElementById(shippingId);
            if (editButton) {
                editButton.click();
            }

            expect(shippingStrategyActionCreator.widgetInteraction).toHaveBeenCalled();
        });

        it('does not binds edit address button if no paymentToken is present on initializationData', async () => {
            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
        });

        it('fails to initialize the strategy if there is no payment method data', async () => {
            const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
            const state = { ...getCheckoutStoreState(), paymentMethods };
            store = createCheckoutStore(state);
            strategy = new AmazonPayV2ShippingStrategy(
                store,
                consignmentActionCreator,
                paymentMethodActionCreator,
                amazonPayV2PaymentProcessor,
                shippingStrategyActionCreator
            );

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);
        });

        it('binds edit address button if paymentToken is present on initializationData', async () => {
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.createButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
            expect(amazonPayV2PaymentProcessor.bindButton).toHaveBeenCalledWith(shippingId, paymentToken, 'changeAddress');
        });

        it('does not initialize the paymentProcessor if no options.methodId are provided', () => {
            initializeOptions.methodId = '';

            expect(strategy.initialize(initializeOptions)).rejects.toThrow(InvalidArgumentError);
            expect(amazonPayV2PaymentProcessor.initialize).not.toHaveBeenCalled();
        });

        it('does not initialize the paymentProcessor if there is no payment method data', () => {
            const paymentMethods = { ...getPaymentMethodsState(), data: undefined };
            const state = { ...getCheckoutStoreState(), paymentMethods };
            store = createCheckoutStore(state);
            strategy = new AmazonPayV2ShippingStrategy(
                store,
                consignmentActionCreator,
                paymentMethodActionCreator,
                amazonPayV2PaymentProcessor,
                shippingStrategyActionCreator
            );

            expect(strategy.initialize(initializeOptions)).rejects.toThrow(MissingDataError);
            expect(amazonPayV2PaymentProcessor.initialize).not.toHaveBeenCalled();
        });

        it('fails to initialize the strategy if no options.methodId is provided', async () => {
            initializeOptions.methodId = '';

            await expect(strategy.initialize(initializeOptions)).rejects.toThrow(InvalidArgumentError);
        });

        it('does not bind edit billing address button if button do not exist', async () => {
            document.body.removeChild(editShippingButton);
            paymentMethodMock.initializationData.paymentToken = paymentToken;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethodOrThrow').mockReturnValue(paymentMethodMock);

            await strategy.initialize(initializeOptions);

            expect(amazonPayV2PaymentProcessor.createButton).not.toHaveBeenCalled();
            expect(amazonPayV2PaymentProcessor.initialize).toHaveBeenCalledWith(paymentMethodMock);
            expect(amazonPayV2PaymentProcessor.bindButton).not.toHaveBeenCalledWith(`#${shippingId}`, paymentToken);

            document.body.appendChild(editShippingButton);
        });
    });

    it('selects shipping option', async () => {
        const method = getFlatRateOption();
        const options = {};
        const action = of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'selectShippingOption')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.selectOption(method.id, options);

        expect(consignmentActionCreator.selectShippingOption).toHaveBeenCalledWith(method.id, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    it('updates address with provided custom fields and existing address', async () => {
        const options = {};
        const amazonShippingAddress = getShippingAddress();
        const address = getShippingAddressWithCustomFields();
        const action = of(createAction(ConsignmentActionType.UpdateConsignmentRequested));

        jest.spyOn(consignmentActionCreator, 'updateAddress')
            .mockReturnValue(action);

        jest.spyOn(store, 'dispatch');

        const output = await strategy.updateAddress(address, options);

        expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith({
            ...amazonShippingAddress,
            customFields: address.customFields,
        }, options);
        expect(store.dispatch).toHaveBeenCalledWith(action);
        expect(output).toEqual(store.getState());
    });

    describe('#deinitialize()', () => {
        let initializeOptions: ShippingInitializeOptions;
        const shippingId = 'edit-ship-address-button';

        beforeEach(async () => {
            initializeOptions = {
                methodId: 'amazonpay',
                amazonpay: {
                    editAddressButtonId: shippingId,
                },
            };
            await strategy.initialize(initializeOptions);
        });

        it('expect to deinitialize the payment processor', async () => {
            await strategy.deinitialize();

            expect(amazonPayV2PaymentProcessor.deinitialize).toHaveBeenCalled();
        });

        it('deinitializes strategy', async () => {
            await strategy.deinitialize();

            expect(await strategy.deinitialize()).toEqual(store.getState());
        });
    });
});
