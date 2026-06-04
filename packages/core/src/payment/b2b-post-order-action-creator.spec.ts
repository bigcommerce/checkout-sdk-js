import { createRequestSender } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { CheckoutStore, createCheckoutStore } from '../checkout';
import { getCheckoutStoreState, getCheckoutStoreStateWithOrder } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getConfig } from '../config/configs.mock';

import B2BPostOrderActionCreator from './b2b-post-order-action-creator';
import { B2BPostOrderActionType } from './b2b-post-order-actions';
import B2BPostOrderRequestSender from './b2b-post-order-request-sender';

describe('B2BPostOrderActionCreator', () => {
    let store: CheckoutStore;
    let requestSender: B2BPostOrderRequestSender;
    let actionCreator: B2BPostOrderActionCreator;

    const comment = 'Invoice comment';
    const invoiceOptions = { isInvoice: true, invoiceComment: comment };
    const nonInvoiceOptions = { isInvoice: false, invoiceComment: '' };
    const b2bApiSettings = {
        clientId: 'dl7c39mdpul6hyc489yk0vzxl6jesyx',
        baseUrl: 'https://api-b2b.bigcommerce.com',
    };

    beforeEach(() => {
        store = createCheckoutStore({
            ...getCheckoutStoreStateWithOrder(),
            b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
        });

        requestSender = new B2BPostOrderRequestSender(createRequestSender());

        jest.spyOn(requestSender, 'closeInvoice').mockResolvedValue(
            getResponse({ data: { paymentId: 'pay_1', receiptId: 'rcpt_1' }, code: 200 }),
        );

        jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            b2bApiSettings,
        });

        actionCreator = new B2BPostOrderActionCreator(requestSender);
    });

    describe('#persistB2BMetadata()', () => {
        it('emits requested and succeeded actions on success', async () => {
            const actions = await from(actionCreator.persistB2BMetadata(invoiceOptions)(store))
                .pipe(toArray())
                .toPromise();

            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                {
                    type: B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                    payload: { receiptId: 'rcpt_1' },
                },
            ]);
        });

        it('calls closeInvoice with the order id, comment, token and base url', async () => {
            await from(actionCreator.persistB2BMetadata(invoiceOptions)(store)).toPromise();

            expect(requestSender.closeInvoice).toHaveBeenCalledWith(
                { orderId: '295', comment },
                'b2b-auth-token',
                b2bApiSettings.baseUrl,
            );
        });

        it('does not call closeInvoice when isInvoice is false', async () => {
            const actions = await from(actionCreator.persistB2BMetadata(nonInvoiceOptions)(store))
                .pipe(toArray())
                .toPromise();

            expect(requestSender.closeInvoice).not.toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                {
                    type: B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                    payload: { receiptId: '' },
                },
            ]);
        });

        it('throws when the order id is missing', () => {
            store = createCheckoutStore({
                ...getCheckoutStoreState(),
                b2bToken: { data: { token: 'b2b-auth-token' }, errors: {}, statuses: {} },
            });

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            expect(() => actionCreator.persistB2BMetadata(invoiceOptions)(store)).toThrow();
        });

        it('throws when the b2b token is missing', () => {
            store = createCheckoutStore(getCheckoutStoreStateWithOrder());

            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings,
            });

            expect(() => actionCreator.persistB2BMetadata(invoiceOptions)(store)).toThrow();
        });

        it('throws when the b2b base url is missing', () => {
            jest.spyOn(store.getState().config, 'getStoreConfig').mockReturnValue({
                ...getConfig().storeConfig,
                b2bApiSettings: { ...b2bApiSettings, baseUrl: '' },
            });

            expect(() => actionCreator.persistB2BMetadata(invoiceOptions)(store)).toThrow();
        });

        it('emits failed action when the request rejects', async () => {
            jest.spyOn(requestSender, 'closeInvoice').mockRejectedValue(getErrorResponse());

            const errorHandler = jest.fn((action) => of(action));
            const actions = await from(actionCreator.persistB2BMetadata(invoiceOptions)(store))
                .pipe(catchError(errorHandler), toArray())
                .toPromise();

            expect(errorHandler).toHaveBeenCalled();
            expect(actions).toEqual([
                { type: B2BPostOrderActionType.PersistB2BMetadataRequested },
                expect.objectContaining({
                    type: B2BPostOrderActionType.PersistB2BMetadataFailed,
                    error: true,
                }),
            ]);
        });
    });
});
