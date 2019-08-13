import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { isInternalAddressEqual, mapFromInternalAddress } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { AmazonPayAddressBook, AmazonPayOrderReference, AmazonPayScriptLoader, AmazonPayWindow } from '../../../payment/strategies/amazon-pay';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { RemoteCheckoutSynchronizationError } from '../../../remote-checkout/errors';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../../shipping-request-options';
import { ShippingStrategyActionType } from '../../shipping-strategy-actions';
import ShippingStrategy from '../shipping-strategy';

import AmazonPayShippingInitializeOptions from './amazon-pay-shipping-initialize-options';

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

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }

    updateAddress(): Promise<InternalCheckoutSelectors> {
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
