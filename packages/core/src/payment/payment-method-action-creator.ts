import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

// TODO: CHECKOUT-9979 remove this import before delivery
import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { ActionOptions, cachableAction } from '../common/data-store';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import B2BCompanyPaymentMethodRequestSender from './b2b-company-payment-method-request-sender';
import filterPaymentMethodsByB2BCompanyAllowList from './b2b-company-payment-method-filter-transformer';
import {
    LoadPaymentMethodAction,
    LoadPaymentMethodsAction,
    PaymentMethodActionType,
} from './payment-method-actions';
import PaymentMethodRequestSender from './payment-method-request-sender';

import { PaymentMethod } from '.';

const isPaymentMethod = (value: PaymentMethod | undefined): value is PaymentMethod => {
    return !!value;
};

export interface PaymentMethodsRequestOptions extends RequestOptions {
    useCompanyAllowList?: boolean;
}

export default class PaymentMethodActionCreator {
    constructor(
        private _requestSender: PaymentMethodRequestSender,
        private _b2bCompanyPaymentMethodRequestSender: B2BCompanyPaymentMethodRequestSender,
    ) {}

    loadPaymentMethodsById(
        methodIds: string[],
        options?: RequestOptions,
    ): ThunkAction<LoadPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) =>
            new Observable((observer: Observer<LoadPaymentMethodsAction>) => {
                const state = store.getState();
                const cartId = state.cart.getCart()?.id;
                const params = cartId ? { ...options?.params, cartId } : { ...options?.params };

                observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsRequested));
                Promise.all(
                    methodIds.map(async (id) => {
                        try {
                            const response = await this._requestSender.loadPaymentMethod(id, {
                                ...options,
                                params,
                            });

                            return response.body;
                        } catch (_e) {
                            return undefined;
                        }
                    }),
                )
                    .then((response) => {
                        const paymentMethods = response.filter(isPaymentMethod);

                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                                paymentMethods,
                            ),
                        );

                        observer.complete();
                    })
                    .catch((response) => {
                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodsFailed,
                                response,
                            ),
                        );
                        observer.complete();
                    });
            });
    }

    loadPaymentMethods(
        options?: PaymentMethodsRequestOptions,
    ): ThunkAction<LoadPaymentMethodsAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<LoadPaymentMethodsAction>) => {
                const state = store.getState();
                const cart = state.cart.getCartOrThrow();

                observer.next(createAction(PaymentMethodActionType.LoadPaymentMethodsRequested));

                this._requestSender
                    .loadPaymentMethods({
                        ...options,
                        params: { ...options?.params, cartId: cart.id },
                    })
                    .then(async (response) => {
                        const meta = {
                            deviceSessionId: response.headers['x-device-session-id'],
                            sessionHash: response.headers['x-session-hash'],
                        };
                        let methods = response.body;

                        if (options?.useCompanyAllowList) {
                            const customer = state.customer.getCustomer();
                            const b2bToken = state.b2bToken.getToken();
                            const b2bBaseUrl = resolveB2bBaseUrl(
                                state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
                            );
                            const companyId = state.cart.getCart()?.companyId;

                            if (
                                !customer ||
                                customer.isGuest ||
                                !b2bToken ||
                                !b2bBaseUrl ||
                                !companyId
                            ) {
                                throw new MissingDataError(
                                    MissingDataErrorType.MissingCheckoutConfig,
                                );
                            }

                            const { body: b2bBody } =
                                await this._b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                                    companyId,
                                    b2bToken,
                                    b2bBaseUrl,
                                    options,
                                );

                            methods = filterPaymentMethodsByB2BCompanyAllowList(methods, b2bBody);
                        }

                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodsSucceeded,
                                methods,
                                meta,
                            ),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(
                                PaymentMethodActionType.LoadPaymentMethodsFailed,
                                response,
                            ),
                        );
                    });
            });
    }

    @cachableAction
    loadPaymentMethod(
        methodId: string,
        options?: RequestOptions & ActionOptions,
    ): ThunkAction<LoadPaymentMethodAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<LoadPaymentMethodAction>) => {
                const state = store.getState();
                const cartId = state.cart.getCart()?.id;
                const params = cartId ? { ...options?.params, cartId } : { ...options?.params };

                observer.next(
                    createAction(PaymentMethodActionType.LoadPaymentMethodRequested, undefined, {
                        methodId,
                    }),
                );

                this._requestSender
                    .loadPaymentMethod(methodId, { ...options, params })
                    .then((response) => {
                        observer.next(
                            createAction(
                                PaymentMethodActionType.LoadPaymentMethodSucceeded,
                                response.body,
                                { methodId },
                            ),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(
                                PaymentMethodActionType.LoadPaymentMethodFailed,
                                response,
                                { methodId },
                            ),
                        );
                    });
            });
    }
}
