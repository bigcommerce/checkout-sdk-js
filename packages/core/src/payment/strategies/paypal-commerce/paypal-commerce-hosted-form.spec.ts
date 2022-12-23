import { Action, createAction } from '@bigcommerce/data-store';
import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';
import { Observable, of } from 'rxjs';

import { Cart } from '../../../cart';
import { getCart } from '../../../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutStoreState } from '../../../checkout/checkouts.mock';
import { OrderActionCreator, OrderActionType } from '../../../order';
import { PaymentMethod } from '../../../payment';
import { PaymentInvalidFormError, PaymentMethodFailedError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentActionType } from '../../payment-actions';
import { getPaypalCommerce } from '../../payment-methods.mock';

import {
    PaypalCommerceFormOptions,
    PaypalCommerceHostedForm,
    PaypalCommercePaymentProcessor,
    PaypalCommerceRequestSender,
    PaypalCommerceScriptLoader,
} from './index';

describe('PaypalCommerceHostedForm', () => {
    let formOptions: PaypalCommerceFormOptions;
    let hostedForm: PaypalCommerceHostedForm;
    let requestSender: RequestSender;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let cart: Cart;
    let containers: HTMLElement[];
    let orderId: string;
    let store: CheckoutStore;
    let orderActionCreator: OrderActionCreator;
    let paymentActionCreator: PaymentActionCreator;
    let paymentMethodMock: PaymentMethod;
    let submitOrderAction: Observable<Action>;
    let submitPaymentAction: Observable<Action>;

    function appendContainer(id: string): HTMLElement {
        const container = document.createElement('div');

        container.id = id;
        document.body.appendChild(container);

        return container;
    }

    const expectEvents = {
        blur: expect.any(Function),
        focus: expect.any(Function),
        cardTypeChange: expect.any(Function),
        validityChange: expect.any(Function),
        inputSubmitRequest: expect.any(Function),
    };

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        submitOrderAction = of(createAction(OrderActionType.SubmitOrderRequested));
        submitPaymentAction = of(createAction(PaymentActionType.SubmitPaymentRequested));
        orderActionCreator = {} as OrderActionCreator;
        orderActionCreator.submitOrder = jest.fn(() => submitOrderAction);
        paymentActionCreator = {} as PaymentActionCreator;
        paymentActionCreator.submitPayment = jest.fn(() => submitPaymentAction);
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(
            new PaypalCommerceScriptLoader(getScriptLoader()),
            new PaypalCommerceRequestSender(requestSender),
            store,
            orderActionCreator,
            paymentActionCreator,
        );
        requestSender = createRequestSender();
        cart = getCart();
        orderId = 'orderId';
        paymentMethodMock = getPaypalCommerce();

        formOptions = {
            fields: {
                cardCode: { containerId: 'cardCode', placeholder: 'Card code' },
                cardName: { containerId: 'cardName', placeholder: 'Card name' },
                cardNumber: { containerId: 'cardNumber', placeholder: 'Card number' },
                cardExpiry: { containerId: 'cardExpiry', placeholder: 'Card expiry' },
            },
            styles: {
                default: { color: '#000' },
                error: { color: '#f00', fontWeight: 'bold' },
                focus: { color: '#00f' },
            },
            onValidate: jest.fn(),
        };

        jest.spyOn(paypalCommercePaymentProcessor, 'initialize').mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'renderHostedFields').mockReturnValue(
            Promise.resolve(),
        );

        jest.spyOn(paypalCommercePaymentProcessor, 'submitHostedFields').mockReturnValue(
            Promise.resolve({ orderId }),
        );

        jest.spyOn(
            paypalCommercePaymentProcessor,
            'getHostedFieldsValidationState',
        ).mockReturnValue({ isValid: true });

        hostedForm = new PaypalCommerceHostedForm(paypalCommercePaymentProcessor);

        containers = [
            appendContainer('cardCode'),
            appendContainer('cardName'),
            appendContainer('cardNumber'),
            appendContainer('cardExpiry'),
        ];
    });

    afterEach(() => {
        containers.forEach((container) => {
            container.parentElement?.removeChild(container);
        });
    });

    it('initialize paypalCommercePaymentProcessor', async () => {
        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith(
            paymentMethodMock.initializationData,
            cart.currency.code,
        );
    });

    it('render hosted fields with form fields', async () => {
        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);

        expect(paypalCommercePaymentProcessor.renderHostedFields).toHaveBeenCalledWith(
            cart.id,
            {
                fields: {
                    cvv: { selector: '#cardCode', placeholder: 'Card code' },
                    expirationDate: { selector: '#cardExpiry', placeholder: 'Card expiry' },
                    number: { selector: '#cardNumber', placeholder: 'Card number' },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
            },
            expectEvents,
            undefined,
        );
    });

    it('render hosted fields with form fields with extra instrument data callback', async () => {
        const getInstrumentDataCallback = expect.any(Function);

        await hostedForm.initialize(
            formOptions,
            cart,
            paymentMethodMock.initializationData,
            getInstrumentDataCallback,
        );

        expect(paypalCommercePaymentProcessor.renderHostedFields).toHaveBeenCalledWith(
            cart.id,
            {
                fields: {
                    cvv: { selector: '#cardCode', placeholder: 'Card code' },
                    expirationDate: { selector: '#cardExpiry', placeholder: 'Card expiry' },
                    number: { selector: '#cardNumber', placeholder: 'Card number' },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
            },
            expectEvents,
            getInstrumentDataCallback,
        );
    });

    it('creates and configures hosted fields for stored card verification', async () => {
        await hostedForm.initialize(
            {
                ...formOptions,
                fields: {
                    cardCodeVerification: {
                        containerId: 'cardCode',
                        placeholder: 'Card code',
                        instrumentId: 'foobar_instrument_id',
                    },
                    cardNumberVerification: {
                        containerId: 'cardNumber',
                        placeholder: 'Card number',
                        instrumentId: 'foobar_instrument_id',
                    },
                },
            },
            cart,
            paymentMethodMock.initializationData,
        );

        expect(paypalCommercePaymentProcessor.renderHostedFields).toHaveBeenCalledWith(
            cart.id,
            {
                fields: {
                    cvv: { selector: '#cardCode', placeholder: 'Card code' },
                    number: { selector: '#cardNumber', placeholder: 'Card number' },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
            },
            expectEvents,
            undefined,
        );
    });

    it('submit hosted form should return orderId', async () => {
        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);

        const result = await hostedForm.submit();

        expect(result.orderId).toEqual(orderId);
    });

    it('submit hosted form should call submitHostedFields of paypalCommercePaymentProcessor', async () => {
        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);
        await hostedForm.submit();

        expect(paypalCommercePaymentProcessor.submitHostedFields).toHaveBeenCalled();
    });

    it('submit hosted form should call submitHostedFields with 3ds of paypalCommercePaymentProcessor', async () => {
        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);
        await hostedForm.submit(true);

        expect(paypalCommercePaymentProcessor.submitHostedFields).toHaveBeenCalledWith({
            cardholderName: '',
            contingencies: ['3D_SECURE'],
        });
    });

    it('throw error if 3ds is enabled and failed during sending', async () => {
        jest.spyOn(paypalCommercePaymentProcessor, 'submitHostedFields').mockReturnValue(
            Promise.resolve({ orderId, liabilityShift: 'NO' }),
        );

        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);

        await expect(hostedForm.submit(true)).rejects.toThrow(PaymentMethodFailedError);
    });

    it('throw error if validate is failed during sending', async () => {
        jest.spyOn(
            paypalCommercePaymentProcessor,
            'getHostedFieldsValidationState',
        ).mockReturnValue({ isValid: false, fields: {} });

        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);

        await expect(hostedForm.submit()).rejects.toThrow(PaymentInvalidFormError);
    });

    it('call onValidate if validate is failed during sending', async () => {
        jest.spyOn(
            paypalCommercePaymentProcessor,
            'getHostedFieldsValidationState',
        ).mockReturnValue({
            isValid: false,
            fields: {
                cvv: { isValid: false },
                expirationDate: { isValid: false },
                number: { isValid: false },
            },
        });

        const errors = {
            cardCode: [
                { fieldType: 'cardCode', message: 'Invalid card code', type: 'invalid_card_code' },
            ],
            cardExpiry: [
                {
                    fieldType: 'cardExpiry',
                    message: 'Invalid card expiry',
                    type: 'invalid_card_expiry',
                },
            ],
            cardNumber: [
                {
                    fieldType: 'cardNumber',
                    message: 'Invalid card number',
                    type: 'invalid_card_number',
                },
            ],
        };

        await hostedForm.initialize(formOptions, cart, paymentMethodMock.initializationData);

        try {
            await hostedForm.submit();
        } catch (e) {
            expect(formOptions.onValidate).toHaveBeenCalledWith({ isValid: false, errors });
        }
    });
});
