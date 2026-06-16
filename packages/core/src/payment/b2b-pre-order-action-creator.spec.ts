import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getCart } from '../cart/carts.mock';
import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';

import B2BPreOrderActionCreator from './b2b-pre-order-action-creator';
import { B2BPreOrderActionType } from './b2b-pre-order-actions';
import B2BPreOrderRequestSender from './b2b-pre-order-request-sender';
import PaymentMethod from './payment-method';

describe('B2BPreOrderActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BPreOrderRequestSender;
    let actionCreator: B2BPreOrderActionCreator;

    const b2bApiSettings = {
        clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx',
        baseUrl: 'https://api-b2b.bigcommerce.com',
    };

    const paymentMethods: PaymentMethod[] = [
        {
            id: 'cheque',
            method: 'check',
            type: 'PAYMENT_TYPE_OFFLINE',
            supportedCards: [],
            config: { displayName: 'Check' },
            skipRedirectConfirmationAlert: false,
        },
        {
            id: 'stripe-card',
            method: 'credit-card',
            type: 'PAYMENT_TYPE_API',
            supportedCards: [],
            gateway: 'stripev3',
            config: {},
            skipRedirectConfirmationAlert: false,
        },
    ];

    beforeEach(() => {
        store = createCheckoutStore({
            ...getCheckoutStoreState(),
            b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
            paymentMethods: {
                data: paymentMethods,
                errors: {},
                statuses: {},
            },
        });

        requestSender = new B2BPreOrderRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'refreshPaymentMethods').mockResolvedValue(getResponse({}));
        jest.spyOn(requestSender, 'submitPreOrderExtraFields').mockResolvedValue(
            getResponse(undefined),
        );

        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            b2bApiSettings,
        });

        actionCreator = new B2BPreOrderActionCreator(requestSender);
    });

    describe('#persistPreOrderB2BMetadata()', () => {
        it('emits requested and succeeded actions on success', async () => {
            const actions = await from(actionCreator.persistPreOrderB2BMetadata({})(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: B2BPreOrderActionType.PreOrderB2BMetadataRequested },
                { type: B2BPreOrderActionType.PreOrderB2BMetadataSucceeded },
            ]);
        });

        it('refreshes payment methods then persists the cart order extra info', async () => {
            await from(
                actionCreator.persistPreOrderB2BMetadata({
                    poNumber: 'PO-1',
                    referenceNumber: 'REF-1',
                })(store),
            ).toPromise();

            expect(requestSender.refreshPaymentMethods).toHaveBeenCalledWith(
                [
                    { code: 'cheque', name: 'Check' },
                    { code: 'stripe-card', name: 'stripev3' },
                ],
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
                undefined,
            );

            expect(requestSender.submitPreOrderExtraFields).toHaveBeenCalledWith(
                getCart().id,
                {
                    poNumber: 'PO-1',
                    referenceNumber: 'REF-1',
                    extraFields: undefined,
                    extraInfo: undefined,
                },
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
                undefined,
            );

            const refreshOrder = (requestSender.refreshPaymentMethods as jest.Mock).mock
                .invocationCallOrder[0];
            const submitOrder = (requestSender.submitPreOrderExtraFields as jest.Mock).mock
                .invocationCallOrder[0];

            expect(refreshOrder).toBeLessThan(submitOrder);
        });

        it('forwards request options to both request sender calls', async () => {
            const options = { timeout: undefined, params: { foo: 'bar' } };

            await from(actionCreator.persistPreOrderB2BMetadata({}, options)(store)).toPromise();

            expect(requestSender.refreshPaymentMethods).toHaveBeenCalledWith(
                expect.any(Array),
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
                options,
            );
            expect(requestSender.submitPreOrderExtraFields).toHaveBeenCalledWith(
                getCart().id,
                expect.any(Object),
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
                options,
            );
        });

        it('throws when the b2b token is missing', () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                paymentMethods: {
                    data: paymentMethods,
                    errors: {},
                    statuses: {},
                },
            });

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            expect(() => actionCreator.persistPreOrderB2BMetadata({})(store)).toThrow();
        });

        it('throws when the b2b base url is missing', () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings: { ...b2bApiSettings, baseUrl: '' },
            });

            expect(() => actionCreator.persistPreOrderB2BMetadata({})(store)).toThrow();
        });

        it('emits failed action when a request rejects', async () => {
            jest.spyOn(requestSender, 'refreshPaymentMethods').mockRejectedValue(
                getErrorResponse(),
            );

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.persistPreOrderB2BMetadata({})(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BPreOrderActionType.PreOrderB2BMetadataRequested },
                expect.objectContaining({
                    type: B2BPreOrderActionType.PreOrderB2BMetadataFailed,
                    error: true,
                }),
            ]);
        });
    });
});
