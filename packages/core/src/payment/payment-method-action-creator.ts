import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

// TODO: CHECKOUT-9979 remove this import before delivery
import { CartSource } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { ActionOptions, cachableAction } from '../common/data-store';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import filterPaymentMethodsByB2BCompanyAllowList from './b2b-company-payment-method-filter-transformer';
import B2BCompanyPaymentMethodRequestSender from './b2b-company-payment-method-request-sender';
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
        options?: RequestOptions,
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

                        console.log('filter methods for b2b');

                        const filterMethodsforB2b = this._filterMethodsForB2b(state);

                        console.log('do we filter methods for b2b', filterMethodsforB2b);

                        if (filterMethodsforB2b) {
                            const params = this._getB2bFilterParams(state);

                            methods = await this._applyB2bCompanyPaymentMethodFilter(
                                methods,
                                params,
                                options,
                            );
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

    private _filterMethodsForB2b(state: InternalCheckoutSelectors) {
        const config = state.config.getStoreConfigOrThrow();
        const cart = state.cart.getCartOrThrow();

        if (cart.source === CartSource.INVOICE) {
            return true;
        } else if (config.checkoutSettings?.capabilities?.payment.b2bPaymentMethodFilter) {
            return true;
        }

        return false;
    }

    private _getB2bFilterParams(state: InternalCheckoutSelectors): {
        companyId: number;
        b2bToken: string;
        baseUrl: string;
        source?: string;
    } {
        const customer = state.customer.getCustomerOrThrow();
        const b2bToken = state.b2bToken.getToken();
        const cart = state.cart.getCartOrThrow();
        const baseUrl = resolveB2bBaseUrl(
            state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
        );
        const { companyId, source } = cart;

        if (customer.isGuest || !b2bToken || !baseUrl || !companyId) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        return { companyId, b2bToken, baseUrl, source };
    }

    private async _applyB2bCompanyPaymentMethodFilter(
        methods: PaymentMethod[],
        params: { companyId: number; b2bToken: string; baseUrl: string; source?: string },
        options?: RequestOptions,
    ): Promise<PaymentMethod[]> {
        console.log('_applyB2bCompanyPaymentMethodFilter');

        if (params.source === CartSource.INVOICE) {
            console.log('_applyB2bCompanyPaymentMethodFilter get invoice');

            return this._applyB2bInvoiceAllowedPaymentMethods(methods, params, options);
        }

        const { body } =
            await this._b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                params.companyId,
                params.b2bToken,
                params.baseUrl,
                options,
            );

        return filterPaymentMethodsByB2BCompanyAllowList(methods, body);
    }

    private async _applyB2bInvoiceAllowedPaymentMethods(
        methods: PaymentMethod[],
        params: { baseUrl: string; b2bToken: string },
        options?: RequestOptions,
    ): Promise<PaymentMethod[]> {
        const { body } =
            await this._b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods(
                params.baseUrl,
                params.b2bToken,
                options,
            );

        return methods.filter((method) => new Set(body.data.allowedMethods).has(method.id));
    }
}
