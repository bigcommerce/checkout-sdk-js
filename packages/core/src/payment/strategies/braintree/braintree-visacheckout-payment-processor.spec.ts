import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { BraintreeScriptLoader } from '@bigcommerce/checkout-sdk/braintree-utils';

import { Address } from '../../../address';
import { getBillingAddress } from '../../../billing/billing-addresses.mock';
import { getConfig } from '../../../config/configs.mock';
import { getShippingAddress } from '../../../shipping/shipping-addresses.mock';

import { BraintreeVisaCheckout } from './braintree';
import BraintreeSDKCreator from './braintree-sdk-creator';
import BraintreeVisaCheckoutPaymentProcessor from './braintree-visacheckout-payment-processor';
import { getVisaCheckoutMock } from './braintree.mock';
import { VisaCheckoutPaymentSuccessPayload } from './visacheckout';
import {
    getPaymentSuccessPayload,
    getTokenizedPayload,
    getVisaCheckoutRequestBody,
} from './visacheckout.mock';

describe('BraintreeVisaCheckoutPaymentProcessor', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let requestSender: RequestSender;

    const storeConfig = getConfig().storeConfig;

    beforeEach(() => {
        const braintreeScriptLoader = new BraintreeScriptLoader(createScriptLoader(), window);

        braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        braintreeSDKCreator.initialize = jest.fn();

        requestSender = createRequestSender();
    });

    it('creates an instance of BraintreeVisaCheckoutProcessor', () => {
        const braintreeVisaCheckoutPaymentProcessor = new BraintreeVisaCheckoutPaymentProcessor(
            braintreeSDKCreator,
            requestSender,
        );

        expect(braintreeVisaCheckoutPaymentProcessor).toBeInstanceOf(
            BraintreeVisaCheckoutPaymentProcessor,
        );
    });

    describe('#initialize()', () => {
        let visaCheckoutMock: BraintreeVisaCheckout;
        let visaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor;

        beforeEach(() => {
            visaCheckoutMock = getVisaCheckoutMock();
            braintreeSDKCreator.getVisaCheckout = jest.fn(() => Promise.resolve(visaCheckoutMock));
            visaCheckoutPaymentProcessor = new BraintreeVisaCheckoutPaymentProcessor(
                braintreeSDKCreator,
                requestSender,
            );
        });

        it('initializes the sdk creator with the client token', () => {
            braintreeSDKCreator.initialize = jest.fn();
            visaCheckoutPaymentProcessor.initialize('clientToken', storeConfig, {});

            expect(braintreeSDKCreator.initialize).toHaveBeenCalledWith('clientToken', storeConfig);
        });

        it('maps the init options to the ones required by the braintree visacheckout module', async () => {
            const visaCheckoutPaymentProcessor = new BraintreeVisaCheckoutPaymentProcessor(
                braintreeSDKCreator,
                requestSender,
            );

            await visaCheckoutPaymentProcessor.initialize('clientToken', storeConfig, {
                locale: 'es_ES',
                collectShipping: true,
                subtotal: 15,
                currencyCode: '$',
            });

            expect(visaCheckoutMock.createInitOptions).toHaveBeenCalledWith({
                paymentRequest: {
                    currencyCode: '$',
                    subtotal: '15',
                },
                settings: {
                    locale: 'es_ES',
                    shipping: {
                        collectShipping: true,
                    },
                },
            });
        });
    });

    describe('#handleSuccess()', () => {
        let visaCheckoutMock: BraintreeVisaCheckout;
        let braintreeVisaCheckoutPaymentProcessor: BraintreeVisaCheckoutPaymentProcessor;
        let billing: Address;
        let shipping: Address;
        let paymentInformation: VisaCheckoutPaymentSuccessPayload;
        let requestBody: any;

        beforeEach(() => {
            visaCheckoutMock = getVisaCheckoutMock();
            braintreeSDKCreator.getVisaCheckout = jest.fn(() => Promise.resolve(visaCheckoutMock));
            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            braintreeSDKCreator.getDataCollector = jest.fn(() =>
                Promise.resolve({
                    deviceData: 'my_device_session_id',
                }),
            );
            billing = getBillingAddress();
            shipping = getShippingAddress();
            paymentInformation = getPaymentSuccessPayload();
            requestBody = getVisaCheckoutRequestBody();

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            requestSender.post = jest.fn(() => Promise.resolve());
            braintreeVisaCheckoutPaymentProcessor = new BraintreeVisaCheckoutPaymentProcessor(
                braintreeSDKCreator,
                requestSender,
            );
        });

        it('posts the relevant information to bcapp to update the current checkout', async () => {
            visaCheckoutMock.tokenize = jest.fn(() => Promise.resolve(getTokenizedPayload()));

            const paymentInformation = getPaymentSuccessPayload();

            await braintreeVisaCheckoutPaymentProcessor.handleSuccess(
                paymentInformation,
                billing,
                shipping,
            );

            expect(requestSender.post).toHaveBeenCalledWith(
                '/checkout.php',
                getVisaCheckoutRequestBody(),
            );
        });

        it('uses current shipping address if not provided by visa checkout', async () => {
            const { shippingAddress, ...tokenizedPayload } = getTokenizedPayload();

            visaCheckoutMock.tokenize = jest.fn(() => Promise.resolve(tokenizedPayload));

            await braintreeVisaCheckoutPaymentProcessor.handleSuccess(
                paymentInformation,
                billing,
                shipping,
            );

            expect(requestSender.post).toHaveBeenCalledWith('/checkout.php', {
                ...requestBody,
                body: expect.objectContaining({
                    shipping_address: expect.objectContaining({
                        email: 'test@example.com',
                        first_name: 'Test',
                        last_name: 'Tester',
                    }),
                }),
            });
        });

        it('uses current billing address if not provided by visa checkout', async () => {
            const { billingAddress, ...tokenizedPayload } = getTokenizedPayload();

            // TODO: remove ts-ignore and update test with related type (PAYPAL-4383)
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            visaCheckoutMock.tokenize = jest.fn(() => Promise.resolve(tokenizedPayload));

            await braintreeVisaCheckoutPaymentProcessor.handleSuccess(
                paymentInformation,
                billing,
                shipping,
            );

            expect(requestSender.post).toHaveBeenCalledWith('/checkout.php', {
                ...requestBody,
                body: expect.objectContaining({
                    billing_address: expect.objectContaining({
                        email: 'test@example.com',
                        first_name: 'Test',
                        last_name: 'Tester',
                    }),
                }),
            });
        });
    });
});
