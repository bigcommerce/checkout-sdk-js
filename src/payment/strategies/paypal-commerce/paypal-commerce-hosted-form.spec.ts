import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaypalCommerceFormOptions, PaypalCommerceHostedForm, PaypalCommercePaymentProcessor, PaypalCommerceRequestSender, PaypalCommerceScriptLoader } from './index';

describe('PaypalCommerceHostedForm', () => {
    let formOptions: PaypalCommerceFormOptions;
    let hostedForm: PaypalCommerceHostedForm;
    let requestSender: RequestSender;
    let paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor;
    let containers: HTMLElement[];
    let orderId: string;

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
        paypalCommercePaymentProcessor = new PaypalCommercePaymentProcessor(new PaypalCommerceScriptLoader(getScriptLoader()), new PaypalCommerceRequestSender(requestSender));
        requestSender = createRequestSender();
        orderId = 'orderId';

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
        };

        jest.spyOn(paypalCommercePaymentProcessor, 'initialize')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'renderHostedFields')
            .mockReturnValue(Promise.resolve());

        jest.spyOn(paypalCommercePaymentProcessor, 'submitHostedFields')
            .mockReturnValue(Promise.resolve({ orderId }));

        hostedForm = new PaypalCommerceHostedForm(paypalCommercePaymentProcessor);

        containers = [
            appendContainer('cardCode'),
            appendContainer('cardName'),
            appendContainer('cardNumber'),
            appendContainer('cardExpiry'),
        ];
    });

    afterEach(() => {
        containers.forEach(container => {
            container.parentElement?.removeChild(container);
        });
    });

    it('initialize paypalCommercePaymentProcessor', async () => {
        await hostedForm.initialize(formOptions, '123', { options: { clientId: '' } });

        expect(paypalCommercePaymentProcessor.initialize).toHaveBeenCalledWith({ options: { clientId: '' } });
    });

    it('render hosted fields with form fields', async () => {
        await hostedForm.initialize(formOptions, '123', { options: { clientId: '' } });

        expect(paypalCommercePaymentProcessor.renderHostedFields)
            .toHaveBeenCalledWith('123', {
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
            }, expectEvents);
    });

    it('creates and configures hosted fields for stored card verification', async () => {
        await hostedForm.initialize({
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
        }, '123', { options: { clientId: '' } });

        expect(paypalCommercePaymentProcessor.renderHostedFields)
            .toHaveBeenCalledWith('123', {
                fields: {
                    cvv: { selector: '#cardCode', placeholder: 'Card code' },
                    number: { selector: '#cardNumber', placeholder: 'Card number' },
                },
                styles: {
                    input: { color: '#000' },
                    '.invalid': { color: '#f00', 'font-weight': 'bold' },
                    ':focus': { color: '#00f' },
                },
            }, expectEvents);
    });

    it('submit hosted form should return orderId', async () => {
        await hostedForm.initialize(formOptions, '123', { options: { clientId: '' } });
        const result = await hostedForm.submit();

        expect(result.orderId).toEqual(orderId);
    });

    it('submit hosted form should call submitHostedFields of paypalCommercePaymentProcessor', async () => {
        await hostedForm.initialize(formOptions, '123', { options: { clientId: '' } });
        await hostedForm.submit();

        expect(paypalCommercePaymentProcessor.submitHostedFields).toHaveBeenCalled();
    });
});
