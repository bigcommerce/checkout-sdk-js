import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import {
    B2BPostOrderActionType,
    PersistB2BMetadataAction,
    PersistB2BMetadataOptions,
} from './b2b-post-order-actions';
import B2BPostOrderRequestSender from './b2b-post-order-request-sender';

export default class B2BPostOrderActionCreator {
    constructor(private _requestSender: B2BPostOrderRequestSender) {}

    persistB2BMetadata({
        isInvoice,
        invoiceComment,
    }: PersistB2BMetadataOptions): ThunkAction<
        PersistB2BMetadataAction,
        InternalCheckoutSelectors
    > {
        return (store) => {
            const state = store.getState();
            const orderId = state.order.getOrder()?.orderId;
            const b2bToken = state.b2bToken.getToken();
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );

            if (!orderId || !b2bToken || !b2bBaseUrl) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            return concat(
                of(createAction(B2BPostOrderActionType.PersistB2BMetadataRequested)),
                defer(async () => {
                    let payload = { receiptId: '' };

                    if (isInvoice) {
                        const { body } = await this._requestSender.closeInvoice(
                            { orderId: `${orderId}`, comment: invoiceComment ?? '' },
                            b2bToken,
                            b2bBaseUrl,
                        );

                        payload = { receiptId: body.data.receiptId };
                    }

                    return createAction(
                        B2BPostOrderActionType.PersistB2BMetadataSucceeded,
                        payload,
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(B2BPostOrderActionType.PersistB2BMetadataFailed, error),
                ),
            );
        };
    }
}
