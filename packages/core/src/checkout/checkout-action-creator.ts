import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, merge, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CartActionCreator } from '../cart';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';
import { ConfigActionCreator, StoreConfig } from '../config';
import HeadlessCustomerActionCreator from '../customer/headless-customer/headless-customer-action-creator';
import { FormFieldsActionCreator } from '../form';

import Checkout, { CheckoutRequestBody } from './checkout';
import { CheckoutActionType, LoadCheckoutAction, UpdateCheckoutAction } from './checkout-actions';
import CheckoutRequestSender from './checkout-request-sender';
import InternalCheckoutSelectors from './internal-checkout-selectors';

export default class CheckoutActionCreator {
    constructor(
        private _checkoutRequestSender: CheckoutRequestSender,
        private _configActionCreator: ConfigActionCreator,
        private _formFieldsActionCreator: FormFieldsActionCreator,
        private _cartActionCreator: CartActionCreator,
        private _headlessCustomerActionCreator: HeadlessCustomerActionCreator,
    ) {}

    loadCheckout(
        id: string,
        options?: RequestOptions,
    ): ThunkAction<LoadCheckoutAction, InternalCheckoutSelectors> {
        return (store) => {
            return concat(
                of(createAction(CheckoutActionType.LoadCheckoutRequested)),
                merge(
                    this._configActionCreator.loadConfig({
                        useCache: true,
                        timeout: options?.timeout,
                        params: { checkoutId: id },
                    }),
                    this._formFieldsActionCreator.loadFormFields({
                        useCache: true,
                        timeout: options?.timeout,
                    }),
                ),
                defer(() => {
                    return this._checkoutRequestSender
                        .loadCheckout(id, options)
                        .then(({ body }) => {
                            return createAction(
                                CheckoutActionType.LoadCheckoutSucceeded,
                                this._shouldTransformCustomerAddress(
                                    store.getState().config.getStoreConfigOrThrow(),
                                )
                                    ? this._transformCustomerAddresses(body)
                                    : body,
                            );
                        });
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(CheckoutActionType.LoadCheckoutFailed, error),
                ),
            );
        };
    }

    loadDefaultCheckout(
        options?: RequestOptions,
    ): ThunkAction<LoadCheckoutAction, InternalCheckoutSelectors> {
        return (store) =>
            concat(
                of(createAction(CheckoutActionType.LoadCheckoutRequested)),
                merge(
                    this._configActionCreator.loadConfig({
                        useCache: true,
                        timeout: options?.timeout,
                    }),
                    this._formFieldsActionCreator.loadFormFields({
                        useCache: true,
                        timeout: options?.timeout,
                    }),
                ),
                defer(async () => {
                    const state = store.getState();
                    const context = state.config.getContextConfig();

                    if (!context || !context.checkoutId) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                    }

                    const { body } = await this._checkoutRequestSender.loadCheckout(
                        context.checkoutId,
                        options,
                    );

                    return createAction(
                        CheckoutActionType.LoadCheckoutSucceeded,
                        this._shouldTransformCustomerAddress(state.config.getStoreConfigOrThrow())
                            ? this._transformCustomerAddresses(body)
                            : body,
                    );
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(CheckoutActionType.LoadCheckoutFailed, error),
                ),
            );
    }

    loadHeadlessCheckout(
        cartId: string,
        options?: RequestOptions,
    ): ThunkAction<LoadCheckoutAction, InternalCheckoutSelectors> {
        return (store) => {
            return concat(
                of(createAction(CheckoutActionType.LoadCheckoutRequested)),
                merge(
                    this._cartActionCreator.loadCard(cartId, { ...options, useCache: true })(store),
                    this._headlessCustomerActionCreator.getHeadlessCustomer(options)(store),
                ),
                defer(() => {
                    const state = store.getState();

                    const cart = state.cart.getCart();

                    if (!cart) {
                        throw new MissingDataError(MissingDataErrorType.MissingCart);
                    }

                    const customer = state.customer.getCustomer();

                    if (!customer) {
                        throw new MissingDataError(MissingDataErrorType.MissingCustomer);
                    }

                    const host = state.config.getHost();

                    return this._checkoutRequestSender
                        .loadHeadlessCheckout(host, options)
                        .then(({ body }) => {
                            return createAction(
                                CheckoutActionType.LoadCheckoutSucceeded,
                                this._transformCustomerAddresses({
                                    ...body,
                                    cart,
                                    customer,
                                }),
                            );
                        });
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(CheckoutActionType.LoadCheckoutFailed, error),
                ),
            );
        };
    }

    updateCheckout(
        body: CheckoutRequestBody,
        options?: RequestOptions,
    ): ThunkAction<UpdateCheckoutAction, InternalCheckoutSelectors> {
        return (store) =>
            new Observable((observer) => {
                const state = store.getState();
                const checkout = state.checkout.getCheckout();

                if (!checkout) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                }

                observer.next(createAction(CheckoutActionType.UpdateCheckoutRequested));

                this._checkoutRequestSender
                    .updateCheckout(checkout.id, body, options)
                    .then(({ body }) => {
                        observer.next(
                            createAction(CheckoutActionType.UpdateCheckoutSucceeded, body),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(CheckoutActionType.UpdateCheckoutFailed, response),
                        );
                    });
            });
    }

    loadCurrentCheckout(
        options?: RequestOptions,
    ): ThunkAction<LoadCheckoutAction, InternalCheckoutSelectors> {
        return (store) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            return this.loadCheckout(checkout.id, options)(store);
        };
    }

    private _shouldTransformCustomerAddress(storeConfig: StoreConfig): boolean {
        return (
            storeConfig.checkoutSettings.features[
                'CHECKOUT-8183.set_shouldSaveAddress_false_for_existing_address'
            ] ?? true
        );
    }

    private _transformCustomerAddresses(body: Checkout): Checkout {
        return {
            ...body,
            customer: {
                ...body.customer,
                addresses: body.customer.addresses.map((address) => ({
                    ...address,
                    shouldSaveAddress: false,
                })),
            },
        };
    }
}
