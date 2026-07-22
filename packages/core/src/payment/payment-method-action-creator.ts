import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { resolveB2bBaseUrl } from '../b2b-dev-tools';
import { InternalCheckoutSelectors } from '../checkout';
import { ActionOptions, cachableAction } from '../common/data-store';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { B2BPaymentMethodFilterType } from '../config/capabilities';

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

                        if (this._shouldFilterForB2b(state)) {
                            methods = await this._applyB2bFilter(methods, state, options);
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

    private _shouldFilterForB2b(state: InternalCheckoutSelectors): boolean {
        const config = state.config.getStoreConfigOrThrow();

        return !!config.checkoutSettings?.capabilities?.payment.b2bPaymentMethodFilterType;
    }

    private async _applyB2bFilter(
        methods: PaymentMethod[],
        state: InternalCheckoutSelectors,
        options?: RequestOptions,
    ): Promise<PaymentMethod[]> {
        const config = state.config.getStoreConfigOrThrow();
        const customer = state.customer.getCustomerOrThrow();
        const cart = state.cart.getCartOrThrow();
        const b2bToken = state.b2bToken.getToken();
        const baseUrl = resolveB2bBaseUrl(
            state.config.getStoreConfig()?.b2bApiSettings?.baseUrl ?? '',
        );

        if (customer.isGuest || !baseUrl || !cart.companyId) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!b2bToken) {
            return methods;
        }

        const b2bPaymentFilterType =
            config.checkoutSettings?.capabilities?.payment.b2bPaymentMethodFilterType;

        if (b2bPaymentFilterType === B2BPaymentMethodFilterType.Invoice) {
            return this._applyB2bInvoiceFilter(methods, baseUrl, b2bToken, options);
        }

        return this._applyB2bCompanyFilter(methods, cart.companyId, b2bToken, baseUrl, options);
    }

    private async _applyB2bCompanyFilter(
        methods: PaymentMethod[],
        companyId: number,
        b2bToken: string,
        baseUrl: string,
        options?: RequestOptions,
    ): Promise<PaymentMethod[]> {
        const { body } =
            await this._b2bCompanyPaymentMethodRequestSender.getB2BCompanyPaymentMethods(
                companyId,
                b2bToken,
                baseUrl,
                options,
            );

        return filterPaymentMethodsByB2BCompanyAllowList(methods, body);
    }

    private async _applyB2bInvoiceFilter(
        methods: PaymentMethod[],
        baseUrl: string,
        b2bToken: string,
        options?: RequestOptions,
    ): Promise<PaymentMethod[]> {
        const { body } =
            await this._b2bCompanyPaymentMethodRequestSender.getB2BInvoiceAllowedPaymentMethods(
                baseUrl,
                b2bToken,
                options,
            );

        return methods.filter((method) => new Set(body.data.allowedMethods).has(method.id));
    }
}
