import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';

import HostedFormOrderDataTransformer from './hosted-form-order-data-transformer';

describe('HostedFormOrderDataTransformer', () => {
    let store: ReadableCheckoutStore;
    let transformer: HostedFormOrderDataTransformer;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        transformer = new HostedFormOrderDataTransformer(store);

        jest.spyOn(store.getState().payment, 'getPaymentToken').mockReturnValue('auth-token');

        jest.spyOn(store.getState().instruments, 'getInstrumentsMeta').mockReturnValue({
            vaultAccessToken: 'vault-token',
        });
    });

    it('transforms payload', () => {
        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: { shouldSaveInstrument: true },
        });

        expect(Object.keys(result)).toEqual(
            expect.arrayContaining([
                'authToken',
                'checkout',
                'config',
                'order',
                'orderMeta',
                'payment',
                'paymentMethod',
                'paymentMethodMeta',
            ]),
        );
    });

    it('includes vault access token if paying with stored instrument', () => {
        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: { instrumentId: '123' },
        });

        expect(result.authToken).toBe('auth-token, vault-token');
    });

    it('does not include vault access token if not paying with stored instrument', () => {
        const result = transformer.transform({
            methodId: 'authorizenet',
            paymentData: {
                ccExpiry: {
                    month: '12',
                    year: '2020',
                },
                ccName: 'Foo Bar',
                ccNumber: '4111 1111 1111 1111',
            },
        });

        expect(result.authToken).toBe('auth-token');
    });

    it('returns AdditionalAction object within response if received as a parameter', () => {
        const additionalActionMock = {
            type: 'recaptcha_v2_verification',
            data: {
                human_verification_token: 'googleRecaptchaToken',
            },
        };

        const result = transformer.transform(
            {
                methodId: 'authorizenet',
                paymentData: { instrumentId: '123' },
            },
            additionalActionMock,
        );

        expect(result.additionalAction).toEqual(additionalActionMock);
    });
});
