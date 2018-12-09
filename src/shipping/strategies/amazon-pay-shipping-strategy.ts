import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { isInternalAddressEqual, mapFromInternalAddress, AddressRequestBody } from '../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, StandardError } from '../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { AmazonPayAddressBook, AmazonPayOrderReference, AmazonPayScriptLoader, AmazonPayWidgetError, AmazonPayWindow } from '../../payment/strategies/amazon-pay';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import { RemoteCheckoutSynchronizationError } from '../../remote-checkout/errors';
import ConsignmentActionCreator from '../consignment-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../shipping-request-options';
import { ShippingStrategyActionType } from '../shipping-strategy-actions';

import ShippingStrategy from './shipping-strategy';

export default class AmazonPayShippingStrategy implements ShippingStrategy {
    private _paymentMethod?: PaymentMethod;
    private _window: AmazonPayWindow;

    constructor(
        private _store: CheckoutStore,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        this._window = window;
    }

    initialize(options: ShippingInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { amazon: amazonOptions, methodId } = options;

        if (!amazonOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.amazon" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => new Promise((resolve, reject) => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const onReady = () => {
                    this._createAddressBook(amazonOptions)
                        .then(resolve)
                        .catch(reject);
                };

                this._scriptLoader.loadWidget(this._paymentMethod, onReady)
                    .catch(reject);
            }))
            .then(() => this._store.getState());
    }

    deinitialize(options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }

    updateAddress(address: AddressRequestBody, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    selectOption(optionId: string, options?: ShippingRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId, options)
        );
    }

    private _createAddressBook(options: AmazonPayShippingInitializeOptions): Promise<AmazonPayAddressBook> {
        return new Promise((resolve, reject) => {
            const { container, onAddressSelect = () => {}, onError = () => {}, onReady = () => {} } = options;
            const merchantId = this._paymentMethod && this._paymentMethod.config.merchantId;

            if (!document.getElementById(container)) {
                return reject(new InvalidArgumentError('Unable to create AmazonPay AddressBook widget without valid container ID.'));
            }

            if (!this._window.OffAmazonPayments) {
                return reject(new NotInitializedError(NotInitializedErrorType.ShippingNotInitialized));
            }

            if (!merchantId) {
                return reject(new MissingDataError(MissingDataErrorType.MissingPaymentMethod));
            }

            const widget = new this._window.OffAmazonPayments.Widgets.AddressBook({
                design: {
                    designMode: 'responsive',
                },
                scope: 'payments:billing_address payments:shipping_address payments:widget profile',
                sellerId: merchantId,
                onAddressSelect: orderReference => {
                    this._synchronizeShippingAddress()
                        .then(() => onAddressSelect(orderReference))
                        .catch(onError);
                },
                onError: error => {
                    reject(error);
                    onError(error);
                },
                onReady: orderReference => {
                    this._updateOrderReference(orderReference)
                        .then(() => {
                            resolve();
                            onReady(orderReference);
                        })
                        .catch(onError);
                },
            });

            widget.bind(container);

            return widget;
        });
    }

    private _synchronizeShippingAddress(): Promise<InternalCheckoutSelectors> {
        const methodId = this._paymentMethod && this._paymentMethod.id;
        const amazon = this._store.getState().remoteCheckout.getCheckout('amazon');
        const referenceId = amazon ? amazon.referenceId : undefined;

        if (!methodId || !referenceId) {
            throw new RemoteCheckoutSynchronizationError();
        }

        return this._store.dispatch(
            createAction(ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId })
        )
            .then(() => this._store.dispatch(
                this._remoteCheckoutActionCreator.initializeShipping(methodId, { referenceId })
            ))
            .then(state => {
                const amazon = state.remoteCheckout.getCheckout('amazon');
                const remoteAddress = amazon && amazon.shipping && amazon.shipping.address;
                const address = state.shippingAddress.getShippingAddress();

                if (remoteAddress === false) {
                    throw new RemoteCheckoutSynchronizationError();
                }

                if (!remoteAddress || isInternalAddressEqual(remoteAddress, address || {})) {
                    return this._store.getState();
                }

                return this._store.dispatch(
                    this._consignmentActionCreator.updateAddress(mapFromInternalAddress(remoteAddress))
                );
            })
            .then(() => this._store.dispatch(
                createAction(ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId })
            ))
            .catch(error => this._store.dispatch(
                createErrorAction(ShippingStrategyActionType.UpdateAddressFailed, error, { methodId })
            ));
    }

    private _updateOrderReference(orderReference: AmazonPayOrderReference): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._remoteCheckoutActionCreator.updateCheckout('amazon', {
                referenceId: orderReference.getAmazonOrderReferenceId(),
            })
        );
    }
}

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Amazon Pay.
 *
 * When Amazon Pay is initialized, a widget will be inserted into the DOM. The
 * widget has a list of shipping addresses for the customer to choose from.
 */
export interface AmazonPayShippingInitializeOptions {
    /**
     * The ID of a container which the address widget should insert into.
     */
    container: string;

    /**
     * A callback that gets called when the customer selects an address option.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onAddressSelect?(reference: AmazonPayOrderReference): void;

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure of the initialization.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;

    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param reference - The order reference provided by Amazon.
     */
    onReady?(reference: AmazonPayOrderReference): void;
}
