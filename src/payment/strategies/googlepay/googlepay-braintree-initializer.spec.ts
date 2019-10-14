import { createScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';
import { BraintreeScriptLoader, BraintreeSDKCreator, GooglePayBraintreeSDK } from '../braintree';

import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import { getCheckoutMock, getGooglePaymentDataMock, getGooglePaymentDataPayload, getGooglePayBraintreeMock, getPaymentMethodMock } from './googlepay.mock';

describe('GooglePayBraintreeInitializer', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;

    beforeEach(() => {
        const braintreeScriptLoader = new BraintreeScriptLoader(createScriptLoader());
        braintreeSDKCreator = new BraintreeSDKCreator(braintreeScriptLoader);
        braintreeSDKCreator.initialize = jest.fn();
    });

    it('creates an instance of GooglePayBraintreeInitializer', () => {
        const googlePayBraintreeInitializer = new GooglePayBraintreeInitializer(braintreeSDKCreator);

        expect(googlePayBraintreeInitializer).toBeInstanceOf(GooglePayBraintreeInitializer);
    });

    describe('#initialize', () => {
        const googlePayMock = getGooglePayBraintreeMock();
        let googlePayBraintreeInitializer: GooglePayBraintreeInitializer;

        beforeEach(() => {
            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getGooglePaymentComponent = jest.fn(() => Promise.resolve(googlePayMock));
            googlePayBraintreeInitializer = new GooglePayBraintreeInitializer(braintreeSDKCreator);
        });

        it('initializes the google pay configuration for braintree', async () => {
            await googlePayBraintreeInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false)
                .then(() => {
                    expect(googlePayMock.createPaymentDataRequest).toHaveBeenCalled();
                    expect(googlePayMock.createPaymentDataRequest).toHaveBeenCalledTimes(1);
                    expect(googlePayMock.createPaymentDataRequest).toHaveBeenCalledWith(getGooglePaymentDataPayload());
                });
        });

        it('initializes the google pay configuration for braintree and fail to create google pay payload', async () => {
            jest.spyOn(googlePayMock, 'createPaymentDataRequest').mockReturnValue(Promise.reject());

            await googlePayBraintreeInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false)
                .catch(error => {
                    expect(error.message).toEqual(`Cannot read property 'authJwt' of undefined`);
                });
        });

        it('initializes the google pay configuration for braintree and platformToken is missing', async () => {
            const paymentMethod: PaymentMethod = getPaymentMethodMock();
            paymentMethod.initializationData = {};

            await googlePayBraintreeInitializer.initialize(getCheckoutMock(), paymentMethod, false)
                .catch(error => {
                    expect(error).toBeInstanceOf(Error);
                    expect(new MissingDataError(MissingDataErrorType.MissingPaymentMethod).message).toEqual(error.message);
                });
        });

        it('initializes the google pay configuration for braintree and clientToken is missing', () => {
            const paymentMethod: PaymentMethod = getPaymentMethodMock();
            paymentMethod.clientToken = undefined;

            try {
                googlePayBraintreeInitializer.initialize(getCheckoutMock(), paymentMethod, false);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toBeTruthy();
                expect(new MissingDataError(MissingDataErrorType.MissingPaymentMethod).message).toEqual(error.message);
            }
        });
    });

    describe('#teardown', () => {
        let googlePayMock: GooglePayBraintreeSDK;
        let googlePayBraintreeInitializer: GooglePayBraintreeInitializer;

        beforeEach(() => {
            googlePayMock = getGooglePayBraintreeMock();
            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getGooglePaymentComponent = jest.fn(() => Promise.resolve(googlePayMock));
            googlePayBraintreeInitializer = new GooglePayBraintreeInitializer(braintreeSDKCreator);
        });

        it('teardowns the initializer', async () => {
            spyOn(braintreeSDKCreator, 'teardown');

            await googlePayBraintreeInitializer.teardown();

            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
            expect(braintreeSDKCreator.teardown).toHaveBeenCalledTimes(1);
        });
    });

    describe('#parseResponse', () => {
        let googlePayMock: GooglePayBraintreeSDK;
        let googlePayBraintreeInitializer: GooglePayBraintreeInitializer;

        beforeEach(() => {
            googlePayMock = getGooglePayBraintreeMock();
            braintreeSDKCreator.initialize = jest.fn();
            braintreeSDKCreator.getGooglePaymentComponent = jest.fn(() => Promise.resolve(googlePayMock));
            googlePayBraintreeInitializer = new GooglePayBraintreeInitializer(braintreeSDKCreator);
        });

        it('parses a response from google pay payload received', async () => {
            await googlePayBraintreeInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false);
            const tokenizePayload = googlePayBraintreeInitializer.parseResponse(getGooglePaymentDataMock());

            expect(tokenizePayload).toBeTruthy();
        });

        it('parses a response from google pay payload received', async () => {
            spyOn(googlePayBraintreeInitializer, 'parseResponse');

            await googlePayBraintreeInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false);
            googlePayBraintreeInitializer.parseResponse(getGooglePaymentDataMock());

            expect(googlePayBraintreeInitializer.parseResponse).toHaveBeenCalled();
            expect(googlePayBraintreeInitializer.parseResponse).toHaveBeenCalledTimes(1);
        });
    });
});
