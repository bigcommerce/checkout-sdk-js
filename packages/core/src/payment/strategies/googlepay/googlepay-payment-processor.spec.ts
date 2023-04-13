import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { noop } from 'lodash';

import { PaymentMethodInvalidError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { getCartState } from '../../../cart/carts.mock';
import { CheckoutRequestSender, CheckoutStore, createCheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { getConfig, getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { ConsignmentActionCreator, ConsignmentRequestSender } from '../../../shipping';
import { SubscriptionsActionCreator, SubscriptionsRequestSender } from '../../../subscription';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getGooglePay, getPaymentMethodsState } from '../../payment-methods.mock';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../braintree';

import {
    GooglePayClient,
    GooglePayInitializer,
    GooglePayIsReadyToPayResponse,
    GooglePaymentsError,
    TokenizePayload,
    TotalPriceStatusType,
} from './googlepay';
import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayScriptLoader from './googlepay-script-loader';
import {
    getGooglePayAddressMock,
    getGooglePaymentDataMock,
    getGooglePayPaymentDataRequestMock,
    getGooglePaySDKMock,
} from './googlepay.mock';

describe('GooglePayPaymentProcessor', () => {
    let processor: GooglePayPaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let googlePayScriptLoader: GooglePayScriptLoader;
    let store: CheckoutStore;
    let googlePayInitializer: GooglePayInitializer;
    let billingAddressActionCreator: BillingAddressActionCreator;
    let clientMock: GooglePayClient;
    let requestSender: RequestSender;
    let consignmentActionCreator: ConsignmentActionCreator;
    const googlePaySDK = getGooglePaySDKMock();

    beforeEach(() => {
        const scriptLoader = createScriptLoader();

        billingAddressActionCreator = new BillingAddressActionCreator(
            new BillingAddressRequestSender(requestSender),
            new SubscriptionsActionCreator(new SubscriptionsRequestSender(requestSender)),
        );

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        paymentMethodActionCreator = new PaymentMethodActionCreator(
            new PaymentMethodRequestSender(requestSender),
        );
        googlePayScriptLoader = new GooglePayScriptLoader(scriptLoader);
        googlePayInitializer = new GooglePayBraintreeInitializer(
            new BraintreeSDKCreator(new BraintreeScriptLoader(scriptLoader)),
        );
        requestSender = createRequestSender();
        googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

        jest.spyOn(googlePayScriptLoader, 'load').mockReturnValue(Promise.resolve(googlePaySDK));
        jest.spyOn(store, 'dispatch').mockReturnValue(Promise.resolve(store.getState()));

        consignmentActionCreator = new ConsignmentActionCreator(
            new ConsignmentRequestSender(requestSender),
            new CheckoutRequestSender(requestSender),
        );

        processor = new GooglePayPaymentProcessor(
            store,
            paymentMethodActionCreator,
            googlePayScriptLoader,
            googlePayInitializer,
            billingAddressActionCreator,
            consignmentActionCreator,
            requestSender,
        );
    });

    it('creates an instance of GooglePayPaymentProcessor', () => {
        expect(processor).toBeInstanceOf(GooglePayPaymentProcessor);
    });

    describe('#initialize', () => {
        beforeEach(() => {
            const googlePayIsReadyToPayResponse = {
                result: true,
            };
            const googlePaymentDataMock = getGooglePaymentDataMock();

            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn(() => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve(new HTMLElement())),
            };

            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );
        });

        it('initializes processor successfully', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                getGooglePay(),
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );

            await processor.initialize('googlepay');

            expect(googlePayScriptLoader.load).toHaveBeenCalled();
        });

        it('initializes processor without paymentMethod', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                undefined,
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );

            try {
                await processor.initialize('googlepay');
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(
                    new MissingDataError(MissingDataErrorType.MissingPaymentMethod),
                );
            }
        });

        it('initializes processor without checkout', async () => {
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                getGooglePay(),
            );
            jest.spyOn(store.getState().checkout, 'getCheckout').mockReturnValue(undefined);
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );

            try {
                await processor.initialize('googlepay');
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingCheckout));
            }
        });

        it('initializes processor without testMode', async () => {
            const googlePayMethod: PaymentMethod = getGooglePay();

            googlePayMethod.config.testMode = undefined;
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                googlePayMethod,
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );

            try {
                await processor.initialize('googlepay');
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
            }
        });

        it('throws when response.result is not defined', async () => {
            const googlePayError: GooglePaymentsError = {
                statusCode: 'Error loading payment data',
            };

            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve({ result: undefined })),
                loadPaymentData: jest.fn(() => Promise.reject(googlePayError)),
                createButton: jest.fn(() => Promise.resolve()),
            };

            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );

            await expect(processor.initialize('googlepay')).rejects.toBeInstanceOf(
                PaymentMethodInvalidError,
            );
        });

        it('should pass hostname as param when loading googlepay', async () => {
            const origin = 'my.alternate-domain.com';

            Object.defineProperty(window, 'location', {
                value: new URL(`https://${origin}`),
            });

            const storeConfigMock = getConfig().storeConfig;

            storeConfigMock.checkoutSettings.features = {
                'INT-5826.google_hostname_alias': true,
            };
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValueOnce(
                storeConfigMock,
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockResolvedValue(
                store.getState(),
            );

            await processor.initialize('googlepay');

            expect(paymentMethodActionCreator.loadPaymentMethod).toHaveBeenCalledWith('googlepay', {
                params: { origin },
            });
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor', async () => {
            jest.spyOn(googlePayInitializer, 'teardown');

            await processor.deinitialize();

            expect(googlePayInitializer.teardown).toHaveBeenCalled();
        });
    });

    describe('#createButton', () => {
        beforeEach(() => {
            const googlePayIsReadyToPayResponse = {
                result: true,
            };
            const googlePaymentDataMock = getGooglePaymentDataMock();

            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn(() => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve()),
            };

            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                getGooglePay(),
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );
        });

        it('creates the html button element', async () => {
            await processor.initialize('googlepay');
            await processor.createButton(jest.fn(noop));

            expect(clientMock.createButton).toHaveBeenCalled();
        });

        it('throws an error when googlePaymentsClient is not initialized', async () => {
            try {
                await processor.createButton(jest.fn(noop));
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(error).toEqual(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            }
        });
    });

    describe('#handleSuccess', () => {
        let tokenizePayload: Promise<TokenizePayload>;

        beforeEach(() => {
            tokenizePayload = Promise.resolve({
                details: {
                    cardType: 'MasterCard',
                    lastFour: '4111',
                    lastTwo: '11',
                },
                type: 'AndroidPayCard',
                nonce: 'nonce',
                description: '',
                binData: {},
            }) as Promise<TokenizePayload>;

            const googlePayIsReadyToPayResponse = {
                result: true,
            };
            const googlePaymentDataMock = getGooglePaymentDataMock();

            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn(() => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve(new HTMLElement())),
            };

            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );
            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                getGooglePay(),
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );
        });

        it('handles success response', async () => {
            jest.spyOn(googlePayInitializer, 'parseResponse').mockReturnValue(tokenizePayload);
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
                getGooglePayAddressMock(),
            );
            jest.spyOn(billingAddressActionCreator, 'updateAddress');

            const googlePaymentDataMock = getGooglePaymentDataMock();

            googlePaymentDataMock.paymentMethodData.info.billingAddress = getGooglePayAddressMock();

            await processor.initialize('googlepay');
            await processor.handleSuccess(googlePaymentDataMock);

            expect(googlePayInitializer.parseResponse).toHaveBeenCalled();
        });

        it('throw response error without fullname', async () => {
            jest.spyOn(googlePayInitializer, 'parseResponse').mockReturnValue(tokenizePayload);
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
                getGooglePayAddressMock(),
            );

            const googlePaymentDataMock = getGooglePaymentDataMock();

            googlePaymentDataMock.paymentMethodData.info.billingAddress.name = '';

            await processor.initialize('googlepay');

            expect(processor.handleSuccess(googlePaymentDataMock)).rejects.toThrow(
                MissingDataError,
            );
        });

        it('throws when methodId from state is missed', async () => {
            jest.spyOn(googlePayInitializer, 'parseResponse').mockReturnValue(
                Promise.resolve(tokenizePayload),
            );
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());
            jest.spyOn(store.getState().billingAddress, 'getBillingAddress').mockReturnValue(
                getGooglePayAddressMock(),
            );

            try {
                await processor.handleSuccess(getGooglePaymentDataMock());

                expect(googlePayInitializer.parseResponse).toHaveBeenCalled();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(error).toEqual(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            }
        });

        it('throws when billingAddress from state is missed', async () => {
            jest.spyOn(googlePayInitializer, 'parseResponse').mockReturnValue(tokenizePayload);
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());

            const googlePaymentDataMock = getGooglePaymentDataMock();

            googlePaymentDataMock.paymentMethodData.info.billingAddress = getGooglePayAddressMock();

            await processor.initialize('googlepay');

            try {
                await processor.handleSuccess(getGooglePaymentDataMock());
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(
                    new MissingDataError(MissingDataErrorType.MissingBillingAddress),
                );
            }
        });
    });

    describe('#displayWallet', () => {
        let googlePayIsReadyToPayResponse: GooglePayIsReadyToPayResponse;
        const googlePaymentDataMock = getGooglePaymentDataMock();

        beforeEach(() => {
            googlePayIsReadyToPayResponse = {
                result: true,
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                getGooglePay(),
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );
        });

        it('displays wallet properly', async () => {
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn(() => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve()),
            };

            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );

            await processor.initialize('googlepay');
            await processor.displayWallet();

            expect(clientMock.isReadyToPay).toHaveBeenCalled();
            expect(clientMock.loadPaymentData).toHaveBeenCalled();
        });

        it('throws when googlePayClient is missed', async () => {
            try {
                await processor.displayWallet();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(error).toEqual(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            }
        });

        it('throws when Google Pay does not load payment data', async () => {
            const googlePayError: GooglePaymentsError = {
                statusCode: 'Error loading payment data',
            };

            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn(() => Promise.reject(googlePayError)),
                createButton: jest.fn(() => Promise.resolve()),
            };

            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );

            await processor.initialize('googlepay');

            try {
                await processor.displayWallet();
            } catch (error) {
                expect(error).toEqual({ statusCode: googlePayError.statusCode });
            }
        });
    });

    describe('#updateShippingAddress', () => {
        const shippingAddress = {
            address1: '1260 28th',
            address2: '',
            address3: '',
            administrativeArea: '',
            companyName: '',
            countryCode: 'US',
            locality: 'FL',
            name: 'ShippingAddress',
            postalCode: '32960',
            sortingCode: '',
            phoneNumber: '',
        };

        beforeEach(() => {
            jest.spyOn(consignmentActionCreator, 'updateAddress').mockResolvedValue({});
        });

        it('should call consigmentActionCreate UpdateAddress', async () => {
            await processor.updateShippingAddress(shippingAddress);

            expect(consignmentActionCreator.updateAddress).toHaveBeenCalledWith({
                address1: '1260 28th',
                address2: '',
                city: 'FL',
                company: '',
                countryCode: 'US',
                customFields: [],
                firstName: 'ShippingAddress',
                lastName: '',
                phone: '',
                postalCode: '32960',
                stateOrProvince: '',
                stateOrProvinceCode: '',
            });
        });
    });

    describe('#updatePaymentDataRequest', () => {
        beforeEach(() => {
            const googlePayIsReadyToPayResponse = {
                result: true,
            };
            const googlePaymentDataMock = getGooglePaymentDataMock();

            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn(() => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve(new HTMLElement())),
            };

            jest.spyOn(store.getState().paymentMethods, 'getPaymentMethod').mockReturnValue(
                getGooglePay(),
            );
            jest.spyOn(paymentMethodActionCreator, 'loadPaymentMethod').mockReturnValue(
                Promise.resolve(store.getState()),
            );
            jest.spyOn(googlePayInitializer, 'initialize').mockReturnValue(
                Promise.resolve(getGooglePayPaymentDataRequestMock()),
            );
        });

        it('should updates payment data request', async () => {
            const googlePaymentDataMock = getGooglePayPaymentDataRequestMock();
            const payloadToUpdate = {
                transactionInfo: {
                    currencyCode: 'EUR',
                    totalPrice: '1.02',
                    totalPriceStatus: TotalPriceStatusType.FINAL,
                },
            };

            googlePaymentDataMock.transactionInfo = payloadToUpdate.transactionInfo;

            await processor.initialize('googlepay');

            processor.updatePaymentDataRequest(payloadToUpdate);

            await processor.displayWallet();

            expect(clientMock.loadPaymentData).toHaveBeenCalledWith(googlePaymentDataMock);
        });
    });
});
