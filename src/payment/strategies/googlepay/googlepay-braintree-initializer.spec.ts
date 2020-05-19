import { createScriptLoader } from '@bigcommerce/script-loader';

import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import PaymentMethod from '../../payment-method';
import { BraintreeScriptLoader, BraintreeSDKCreator, GooglePayBraintreeSDK } from '../braintree';

import GooglePayBraintreeInitializer from './googlepay-braintree-initializer';
import { getBraintreePaymentDataPayload, getCheckoutMock, getGooglePaymentDataMock, getGooglePayBraintreeMock, getPaymentMethodMock } from './googlepay.mock';

describe('GooglePayBraintreeInitializer', () => {
    let braintreeSDKCreator: BraintreeSDKCreator;
    let googlePayInitializer: GooglePayBraintreeInitializer;
    let googlePayMock: GooglePayBraintreeSDK;

    beforeEach(() => {
        googlePayMock = getGooglePayBraintreeMock();
        braintreeSDKCreator = new BraintreeSDKCreator(new BraintreeScriptLoader(createScriptLoader()));
        googlePayInitializer = new GooglePayBraintreeInitializer(braintreeSDKCreator);
        braintreeSDKCreator.initialize = jest.fn();
        braintreeSDKCreator.getGooglePaymentComponent = jest.fn(() => Promise.resolve(googlePayMock));
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for braintree', async () => {
            await googlePayInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false)
                .then(() => {
                    expect(googlePayMock.createPaymentDataRequest).toHaveBeenCalled();
                    expect(googlePayMock.createPaymentDataRequest).toHaveBeenCalledTimes(1);
                    expect(googlePayMock.createPaymentDataRequest).toHaveBeenCalledWith(getBraintreePaymentDataPayload());
                });
        });

        it('initializes the google pay configuration for braintree and fail to create google pay payload', async () => {
            jest.spyOn(googlePayMock, 'createPaymentDataRequest').mockReturnValue(Promise.reject());

            await googlePayInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false)
                .catch(error => {
                    expect(error.message).toEqual(`Cannot read property 'authJwt' of undefined`);
                });
        });

        it('initializes the google pay configuration for braintree and platformToken is missing', async () => {
            const paymentMethod: PaymentMethod = getPaymentMethodMock();
            paymentMethod.initializationData = {};

            await googlePayInitializer.initialize(getCheckoutMock(), paymentMethod, false)
                .catch(error => {
                    expect(error).toBeInstanceOf(Error);
                    expect(new MissingDataError(MissingDataErrorType.MissingPaymentMethod).message).toEqual(error.message);
                });
        });

        it('initializes the google pay configuration for braintree and clientToken is missing', () => {
            const paymentMethod: PaymentMethod = getPaymentMethodMock();
            paymentMethod.clientToken = undefined;

            try {
                googlePayInitializer.initialize(getCheckoutMock(), paymentMethod, false);
            } catch (error) {
                expect(error).toBeInstanceOf(MissingDataError);
                expect(error).toBeTruthy();
                expect(new MissingDataError(MissingDataErrorType.MissingPaymentMethod).message).toEqual(error.message);
            }
        });
    });

    describe('#teardown', () => {
        it('teardowns the initializer', async () => {
            spyOn(braintreeSDKCreator, 'teardown');

            await googlePayInitializer.teardown();

            expect(braintreeSDKCreator.teardown).toHaveBeenCalled();
            expect(braintreeSDKCreator.teardown).toHaveBeenCalledTimes(1);
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            await googlePayInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false);
            const tokenizePayload = googlePayInitializer.parseResponse(getGooglePaymentDataMock());

            expect(tokenizePayload).toBeTruthy();
        });

        it('parses a response from google pay payload received', async () => {
            spyOn(googlePayInitializer, 'parseResponse');

            await googlePayInitializer.initialize(getCheckoutMock(), getPaymentMethodMock(), false);
            googlePayInitializer.parseResponse(getGooglePaymentDataMock());

            expect(googlePayInitializer.parseResponse).toHaveBeenCalled();
            expect(googlePayInitializer.parseResponse).toHaveBeenCalledTimes(1);
        });
    });
});
