import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import B2BCompanyPaymentMethod from './b2b-company-payment-method';
import {
    B2BCompanyPaymentMethodActionType,
    LoadB2BCompanyPaymentMethodsAction,
} from './b2b-company-payment-method-actions';
import B2BCompanyPaymentMethodRequestSender from './b2b-company-payment-method-request-sender';

export default class B2BCompanyPaymentMethodActionCreator {
    constructor(private _requestSender: B2BCompanyPaymentMethodRequestSender) {}

    loadB2BCompanyPaymentMethods(
        options?: RequestOptions,
    ): ThunkAction<LoadB2BCompanyPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const customer = state.customer.getCustomer();
            const b2bToken = state.b2bToken.getToken();
            // TODO: CHECKOUT-9979 revert to const b2bBaseUrl = state.config.getStoreConfig()?.b2bApiSettings?.baseUrl
            const b2bBaseUrl = resolveB2bBaseUrl(
                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
            );
            const companyId = store.getState().cart.getCart()?.companyId;

            return concat(
                of(
                    createAction(
                        B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsRequested,
                    ),
                ),
                defer(async () => {
                    if (!customer || customer.isGuest || !b2bToken || !b2bBaseUrl || !companyId) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                    }

                    const { body: methodsBody } =
                        await this._requestSender.getB2BCompanyPaymentMethods(
                            companyId,
                            b2bToken,
                            b2bBaseUrl,
                            options,
                        );

                    const methods: B2BCompanyPaymentMethod[] = methodsBody.data.map((method) => ({
                        code: method.code,
                        name: method.name,
                        isEnabled: method.isEnabled === '1',
                        paymentId: method.paymentId,
                    }));

                    return createAction(
                        B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsSucceeded,
                        methods,
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(
                        B2BCompanyPaymentMethodActionType.LoadB2BCompanyPaymentMethodsFailed,
                        error,
                    ),
                ),
            );
        };
    }
}
