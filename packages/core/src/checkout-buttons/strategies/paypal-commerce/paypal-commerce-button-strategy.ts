import { FormPoster } from '@bigcommerce/form-poster';
import { noop } from 'lodash';

import { BillingAddressActionCreator } from '../../../billing/';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
import { PaymentActionCreator, PaymentMethod } from '../../../payment/';
import { ApproveActions, ApproveDataOptions, ButtonsOptions, ClickDataOptions, OnCancelData, PaypalCommercePaymentProcessor, ShippingAddress, ShippingOptionsPayload, PaypalCommerceInitializationData } from '../../../payment/strategies/paypal-commerce';
import { ConsignmentActionCreator } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';
import { AddressRequestBody } from '../../../address';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethod<PaypalCommerceInitializationData>;
    private _isCredit?: boolean;
    private _currentShippingAddress?: AddressRequestBody;
    private _isVenmoEnabled?: boolean;
    private _isVenmo?: boolean;
    private _onPaymentApproveCallback = noop;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _orderActionCreator: OrderActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { initializationData } = paymentMethod;
        this._paymentMethod = paymentMethod;
        const { isHostedCheckoutEnabled, isVenmoEnabled, clientId } = initializationData || {};
        if (!clientId) {
            throw new InvalidArgumentError('Unable to initialise payment because "Client Id" is not defined');
        }
        await this._store.dispatch(this._consignmentActionCreator.loadShippingOptions());
        this._isVenmoEnabled = isVenmoEnabled;
        const cart = state.cart.getCartOrThrow();

        const buttonParams: ButtonsOptions = {
            onApprove: (data, actions) => this._onApproveHandler(data, actions),
            onClick: (data) =>  this._handleClickButtonProvider(data),
            onCancel: (data) => this._handleOnCancel(data),
            ...(isHostedCheckoutEnabled && { onShippingChange: (data) => this._onShippingChangeHandler(data) }),
            style: options?.paypalCommerce?.style,
        };

        const onPaymentApprove  = options.paypalCommerce?.onPaymentApprove;

        if (onPaymentApprove) {
            this._onPaymentApproveCallback = onPaymentApprove;
        }

        const messagingContainer = options.paypalCommerce?.messagingContainer;
        const isMessagesAvailable = Boolean(messagingContainer && document.getElementById(messagingContainer));

        await this._paypalCommercePaymentProcessor.initialize(paymentMethod, cart.currency.code, false);

        this._paypalCommercePaymentProcessor.renderButtons(cart.id, `#${options.containerId}`, buttonParams);

        if (isMessagesAvailable) {
            this._paypalCommercePaymentProcessor.renderMessages(cart.cartAmount, `#${messagingContainer}`);
        }

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        this._isCredit = undefined;
        this._isVenmo = undefined;

        return Promise.resolve();
    }

    private async _handleOnCancel(_data: OnCancelData) {
        const existingConsignments = this._store.getState().consignments.getConsignmentsOrThrow();
        const { email } = this._store.getState().billingAddress.getBillingAddressOrThrow();
        const { firstName, lastName, address1 } = existingConsignments?.[0].shippingAddress || {};
        if (this._currentShippingAddress) {
            const shippingAddress = {
                ...this._currentShippingAddress,
                firstName: firstName !== 'Fake' ? firstName : '',
                lastName: lastName !== 'Fake' ? lastName : '',
                address1: address1 !== 'Fake street' ? address1 : '',
                email: email !== 'fake@fake.fake' ? email : '',
            };
            await this._store.dispatch(this._billingAddressActionCreator.updateAddress(shippingAddress));
            await this._store.dispatch(this._consignmentActionCreator.updateAddress(shippingAddress));
        }
    }

    private isOnlyDigitalItem() {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const { digitalItems, physicalItems  } = cart.lineItems;

        return  digitalItems.length && !physicalItems.length;
    }

    private _onApproveHandler(data: ApproveDataOptions, actions: ApproveActions) {
        if (!this._paymentMethod?.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { isHostedCheckoutEnabled } = this._paymentMethod.initializationData;
        return isHostedCheckoutEnabled && !this.isOnlyDigitalItem() // Workaround for digital items only
            ? this._onHostedMethodApprove(data, actions)
            : this._tokenizePayment(data);
    }

    private _handleClickButtonProvider({ fundingSource }: ClickDataOptions): void {
        this._isCredit = fundingSource === 'credit' || fundingSource === 'paylater';
        this._isVenmo = fundingSource === 'venmo';
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions) {
        if (!orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }
        let provider;

        if (this._isVenmo && this._isVenmoEnabled) {
            provider = 'paypalcommercevenmo';
        } else if (this._isCredit) {
            provider = 'paypalcommercecredit';
        } else {
            provider = 'paypalcommerce';
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider,
            order_id: orderID,
        });
    }

    private async _onHostedMethodApprove(data: ApproveDataOptions, actions: ApproveActions) {
        try {
            const orderDetails = await actions.order.get();
            if (!this._paymentMethod?.id) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }
            const methodId = this._paymentMethod?.id;

            if (this._currentShippingAddress) {
                const shippingAddress = {
                    ...this._currentShippingAddress,
                    firstName: orderDetails.payer.name.given_name,
                    lastName: orderDetails.payer.name.surname,
                    email: orderDetails.payer.email_address,
                    address1: orderDetails.purchase_units[0].shipping.address.address_line_1,
                };

                await this._store.dispatch(this._billingAddressActionCreator.updateAddress(shippingAddress));

                await this._store.dispatch(this._consignmentActionCreator.updateAddress(shippingAddress));

                const submitOrderPayload = {};
                const submitOrderOptions = {
                    params: {
                        methodId,
                    },
                };

                await this._store.dispatch(this._orderActionCreator.submitOrder(submitOrderPayload, submitOrderOptions));

                const paymentData = {
                    formattedPayload: {
                        vault_payment_instrument: null,
                        set_as_default_stored_instrument: null,
                        device_info: null,
                        method_id: methodId,
                        paypal_account: {
                            order_id: data.orderID,
                        },
                    },
                };
                await this._store.dispatch(this._paymentActionCreator.submitPayment({ methodId, paymentData }));
                this._onPaymentApproveCallback();
            }
        } catch (e) {
            throw new RequestError(e);
        }
    }

    private async _onShippingChangeHandler(data: ShippingOptionsPayload) {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const { id: selectedShippingOptionId } = data.selected_shipping_option || {};
        const shippingAddress = await this._transformToAddress(data.shipping_address);
        this._currentShippingAddress = shippingAddress;
        await this._store.dispatch(this._consignmentActionCreator.updateAddress(shippingAddress));
        const updatedConsignment = state.consignments.getConsignmentsOrThrow()[0];
        const { availableShippingOptions } = updatedConsignment;
        const { id: recommendedShippingOptionId } = availableShippingOptions?.find(option => option.isRecommended) || {};
        const isSelectedOptionExist = selectedShippingOptionId && availableShippingOptions?.find(option => option.id === selectedShippingOptionId);
        await this._store.dispatch(this._billingAddressActionCreator.updateAddress(shippingAddress));
        const shippingOptionId = isSelectedOptionExist ? selectedShippingOptionId : recommendedShippingOptionId;

        if (shippingOptionId) {
            await this._store.dispatch(this._consignmentActionCreator.selectShippingOption(
                shippingOptionId
            ));
        }

        if (availableShippingOptions) {
            await this._paypalCommercePaymentProcessor.setShippingOptions({
                ...data,
                cartId: cart.id,
                availableShippingOptions,
            });
        }
    }

    private async _transformToAddress({city, postal_code, country_code}: ShippingAddress) {
        const state = this._store.getState();
        const existingConsignment = state.consignments.getConsignmentsOrThrow();
        const billingAddress = state.billingAddress.getBillingAddressOrThrow();
        const { email } = billingAddress;

        const { firstName, lastName, address1 } = existingConsignment[0]?.shippingAddress || {};
        const shippingData = {
            city: city,
            postalCode: postal_code,
            countryCode: country_code,
            firstName: firstName || 'Fake',
            lastName: lastName || 'Fake',
            address1: address1 || 'Fake street',
            email: email || 'fake@fake.fake',
            address2: '',
            stateOrProvince: '',
            stateOrProvinceCode: '',
            phone: '',
            company: '',
            customFields: []
        };

        return shippingData;
    }
}
