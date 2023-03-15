import { getConsignment } from '../../../shipping/consignments.mock';

import GooglePayStripeInitializer from './googlepay-stripe-initializer';
import {
    getCheckoutMock,
    getStripePaymentDataMock,
    getStripePaymentDataRequest,
    getStripePaymentMethodMock,
    getStripeTokenizedPayload,
} from './googlepay.mock';

describe('GooglePayStripeInitializer', () => {
    let googlePayInitializer: GooglePayStripeInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayStripeInitializer();
    });

    it('creates an instance of GooglePayStripeInitializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayStripeInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Stripe', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getStripePaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getStripePaymentDataRequest());
        });

        it('initializes the google pay configuration for stripe with Buy Now Flow', async () => {
            const paymentDataRequest = {
                ...getStripePaymentDataRequest(),
                transactionInfo: {
                    ...getStripePaymentDataRequest().transactionInfo,
                    currencyCode: '',
                    totalPrice: '',
                },
            };

            await googlePayInitializer
                .initialize(undefined, getStripePaymentMethodMock(), false)
                .then((response) => {
                    expect(response).toEqual(paymentDataRequest);
                });
        });

        it('should not require shipping address when BOPIS is enabled', async () => {
            const checkout = {
                ...getCheckoutMock(),
                consignments: [
                    {
                        ...getConsignment(),
                        selectedShippingOption: undefined,
                        selectedPickupOption: {
                            pickupMethodId: 1,
                        },
                    },
                ],
            };
            const paymentMethod = getStripePaymentMethodMock();

            paymentMethod.initializationData = {
                ...paymentMethod.initializationData,
                bopis: {
                    enabled: true,
                    requiredAddress: 'none',
                },
            };

            const initialize = await googlePayInitializer.initialize(
                checkout,
                paymentMethod,
                false,
            );

            expect(initialize).toEqual({
                ...getStripePaymentDataRequest(),
                shippingAddressRequired: false,
            });
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(
                getStripePaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getStripeTokenizedPayload());
        });
    });
});
