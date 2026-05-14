import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';

import { LoadPoConfigAction, PoConfigActionType } from './po-config-actions';
import PoConfigRequestSender, { PoConfigResponseBody } from './po-config-request-sender';
import { PoConfig } from './po-config-state';

export default class PoConfigActionCreator {
    constructor(private _requestSender: PoConfigRequestSender) {}

    loadPoConfig(
        options?: RequestOptions,
    ): ThunkAction<LoadPoConfigAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const storeConfig = state.config.getStoreConfigOrThrow();
            const { baseUrl: b2bBaseUrl = '', clientId: b2bClientId = '' } =
                storeConfig.b2bApiSettings ?? {};
            const b2bToken = state.b2bToken.getToken() ?? '';

            return concat(
                of(createAction(PoConfigActionType.LoadPoConfigRequested)),
                defer(async () => {
                    const { body } = await this._requestSender.getPoConfig(
                        b2bClientId,
                        b2bBaseUrl,
                        b2bToken,
                        options,
                    );

                    return createAction(
                        PoConfigActionType.LoadPoConfigSucceeded,
                        normalisePoConfig(body),
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(PoConfigActionType.LoadPoConfigFailed, error),
                ),
            );
        };
    }
}

function normalisePoConfig(body: PoConfigResponseBody): PoConfig {
    const { data } = body;

    return {
        enabled: data.checkoutPaymentPurchaseEnableExtra.value === '1',
        label: data.checkoutPaymentPurchaseExtraFields.value,
        required: data.checkoutPaymentPurchaseExtraFieldsRequired.value === '1',
    };
}
