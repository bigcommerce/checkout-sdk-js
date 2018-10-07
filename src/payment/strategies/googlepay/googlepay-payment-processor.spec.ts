import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { BillingAddressActionCreator, BillingAddressRequestSender } from '../../../billing';
import { getCartState } from '../../../cart/carts.mock';
import { createCheckoutStore, CheckoutStore } from '../../../checkout';
import { getCheckoutState } from '../../../checkout/checkouts.mock';
import {
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    StandardError
} from '../../../common/error/errors';
import { getConfigState } from '../../../config/configs.mock';
import { getCustomerState } from '../../../customer/customers.mock';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import { PaymentMethodActionCreator } from '../../index';
import PaymentMethod from '../../payment-method';
import PaymentMethodRequestSender from '../../payment-method-request-sender';
import { getGooglePay, getPaymentMethodsState } from '../../payment-methods.mock';
import { BraintreeScriptLoader, BraintreeSDKCreator } from '../braintree';

import {
    GooglePaymentsError,
    GooglePayClient,
    GooglePayInitializer,
    GooglePayIsReadyToPayResponse
} from './googlepay';
import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import GooglePayPaymentProcessor from './googlepay-payment-processor';
import GooglePayScriptLoader from './googlepay-script-loader';
import {
    getGooglePaymentDataMock,
    getGooglePayAddressMock,
    getGooglePayPaymentDataRequestMock,
    getGooglePaySDKMock
} from './googlepay.mock';

describe('GooglePayPaymentProcessor', () => {
    let processor: GooglePayPaymentProcessor;
    let paymentMethodActionCreator: PaymentMethodActionCreator;
    let googlePayScriptLoader: GooglePayScriptLoader;
    let store: CheckoutStore;
    let googlePayInitializer: GooglePayInitializer;
    let billingAddressActionCreator: BillingAddressActionCreator;
    let clientMock: GooglePayClient;

    beforeEach(() => {
        const requestSender = createRequestSender();
        const _requestSender: PaymentMethodRequestSender = new PaymentMethodRequestSender(requestSender);
        const scriptLoader = createScriptLoader();
        const braintreeScriptLoader = new BraintreeScriptLoader(scriptLoader);
        const braintreeSdkCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        billingAddressActionCreator = new BillingAddressActionCreator(new BillingAddressRequestSender(requestSender));

        store = createCheckoutStore({
            checkout: getCheckoutState(),
            customer: getCustomerState(),
            config: getConfigState(),
            cart: getCartState(),
            paymentMethods: getPaymentMethodsState(),
        });
        paymentMethodActionCreator = new PaymentMethodActionCreator(_requestSender);
        googlePayScriptLoader = new GooglePayScriptLoader(createScriptLoader());
        googlePayInitializer = new GooglePayBraintreeInitializer(braintreeSdkCreator);

        processor = new GooglePayPaymentProcessor(
            store,
            paymentMethodActionCreator,
            googlePayScriptLoader,
            googlePayInitializer,
            billingAddressActionCreator
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
            const googlePaySDK = getGooglePaySDKMock();
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn((a: any) => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve(new HTMLElement())),
            };
            googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

            spyOn(googlePayScriptLoader, 'load').and.returnValue(Promise.resolve(googlePaySDK));
            spyOn(googlePayInitializer, 'initialize').and.returnValue(Promise.resolve());
        });

        it('initializes processor successfully', async () => {
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(getGooglePay());
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));

            await processor.initialize('googlepay');

            expect(googlePayScriptLoader.load).toHaveBeenCalled();
        });

        it('initializes processor without paymentMethod', async () => {
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(undefined);
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));

            try {
                await processor.initialize('googlepay');
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }
        });

        it('initializes processor without checkout', async () => {
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(getGooglePay());
            spyOn(store.getState().checkout, 'getCheckout').and.returnValue(undefined);
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));

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
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(googlePayMethod);
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));

            try {
                await processor.initialize('googlepay');
            } catch (error) {
                expect(error).toBeInstanceOf(StandardError);
                expect(error).toEqual(new StandardError(new MissingDataError(MissingDataErrorType.MissingPaymentMethod).message));
            }
        });
    });

    describe('#deinitialize', () => {
        it('deinitializes processor', async () => {
            spyOn(googlePayInitializer, 'teardown');

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
            const googlePaySDK = getGooglePaySDKMock();
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn((a: any) => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve()),
            };
            googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

            spyOn(googlePayScriptLoader, 'load').and.returnValue(Promise.resolve(googlePaySDK));
            spyOn(googlePayInitializer, 'initialize').and.returnValue(Promise.resolve());
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(getGooglePay());
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));
        });

        it('creates the html button element', async () => {
            await processor.initialize('googlepay');
            await processor.createButton(jest.fn(() => {}));

            expect(clientMock.createButton).toHaveBeenCalled();
        });
    });

    describe('#parseResponse', () => {
        it('parses response', async () => {
            spyOn(googlePayInitializer, 'parseResponse');

            await processor.parseResponse(getGooglePaymentDataMock());

            expect(googlePayInitializer.parseResponse).toHaveBeenCalled();
        });
    });

    describe('#updateBillingAddress', () => {
        beforeEach(() => {
            const googlePayIsReadyToPayResponse = {
                result: true,
            };
            const googlePaymentDataMock = getGooglePaymentDataMock();
            const googlePaySDK = getGooglePaySDKMock();
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn((a: any) => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve()),
            };
            googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

            spyOn(googlePayScriptLoader, 'load').and.returnValue(Promise.resolve(googlePaySDK));
            spyOn(googlePayInitializer, 'initialize').and.returnValue(Promise.resolve());
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(getGooglePay());
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));
        });

        it('updates billing address', async () => {
            spyOn(store.getState().billingAddress, 'getBillingAddress').and.returnValue({id: 'id'});
            spyOn(billingAddressActionCreator, 'updateAddress');

            await processor.initialize('googlepay');
            await processor.updateBillingAddress(getGooglePayAddressMock());

            expect(billingAddressActionCreator.updateAddress).toHaveBeenCalled();
        });

        it('throws when billingAddress from state is missed', async () => {
            try {
                await processor.updateBillingAddress(getGooglePayAddressMock());
            } catch (error) {
                expect(error).toBeInstanceOf(RemoteCheckoutSynchronizationError);
                expect(error).toEqual(new RemoteCheckoutSynchronizationError());
            }
        });

        it('throws when billingAddress from state is missed', async () => {
            await processor.initialize('googlepay');

            try {
                await processor.updateBillingAddress(getGooglePayAddressMock());
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toEqual(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }
        });
    });

    describe('#displayWallet', () => {
        let googlePayIsReadyToPayResponse: GooglePayIsReadyToPayResponse;
        const googlePaymentDataMock = getGooglePaymentDataMock();
        const googlePaySDK = getGooglePaySDKMock();

        beforeEach(() => {
            googlePayIsReadyToPayResponse = {
                result: true,
            };

            spyOn(googlePayScriptLoader, 'load').and.returnValue(Promise.resolve(googlePaySDK));
            spyOn(store, 'dispatch').and.returnValue(Promise.resolve(store.getState()));
            spyOn(store.getState().paymentMethods, 'getPaymentMethod').and.returnValue(getGooglePay());
            spyOn(paymentMethodActionCreator, 'loadPaymentMethod').and.returnValue(Promise.resolve(store.getState()));
        });

        it('displays wallet properly', async () => {
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn((a: any) => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve()),
            };
            googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

            spyOn(googlePayInitializer, 'initialize').and.returnValue(Promise.resolve(getGooglePayPaymentDataRequestMock()));

            await processor.initialize('googlepay');
            await processor.displayWallet();

            expect(clientMock.isReadyToPay).toHaveBeenCalled();
            expect(clientMock.loadPaymentData).toHaveBeenCalled();
        });

        it('throws when googlePaymentDataRequest is missed', async () => {
            try {
                await processor.displayWallet();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(error).toEqual(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
            }
        });

        it('throws when Google Pay is not ready to pay', async () => {
            googlePayIsReadyToPayResponse = {
                result: false,
            };
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn((a: any) => Promise.resolve(googlePaymentDataMock)),
                createButton: jest.fn(() => Promise.resolve()),
            };
            googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

            spyOn(googlePayInitializer, 'initialize').and.returnValue(Promise.resolve(getGooglePayPaymentDataRequestMock()));

            await processor.initialize('googlepay');

            try {
                await processor.displayWallet();
            } catch (error) {
                expect(error).toBeInstanceOf(NotInitializedError);
                expect(error).toEqual(new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized));
            }
        });

        it('throws when Google Pay does not load payment data', async () => {
            const googlePayError: GooglePaymentsError = {
                statusCode: 'Error loading payment data',
            };
            clientMock = {
                isReadyToPay: jest.fn(() => Promise.resolve(googlePayIsReadyToPayResponse)),
                loadPaymentData: jest.fn((a: any) => Promise.reject(googlePayError)),
                createButton: jest.fn(() => Promise.resolve()),
            };
            googlePaySDK.payments.api.PaymentsClient = jest.fn(() => clientMock);

            spyOn(googlePayInitializer, 'initialize').and.returnValue(Promise.resolve(getGooglePayPaymentDataRequestMock()));

            await processor.initialize('googlepay');

            try {
                await processor.displayWallet();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error).toEqual(new Error(googlePayError.statusCode));
            }
        });
    });
});
