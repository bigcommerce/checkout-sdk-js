import { FormPoster } from '@bigcommerce/form-poster';
import { includes } from 'lodash';

import { BillingAddressActionCreator } from '../../../billing/';
import { Cart, CollectedLineItem, LineItemMap } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { Country, CountryActionCreator, Region, UnitedStatesCodes, UNITED_STATES_CODES } from '../../../geography';
import { OrderActionCreator } from '../../../order';
import { PaymentActionCreator } from '../../../payment/';
import {
    ApproveActions,
    ApproveDataOptions,
    ButtonsOptions,
    ClickDataOptions,
    CurrentShippingAddress,
    FundingType,
    PaymentMethodInitializationData,
    PaypalCommerceInitializationData,
    PaypalCommercePaymentProcessor,
    PaypalCommerceScriptParams,
    ShippingAddress,
    ShippingChangeData,
    ShippingData
} from '../../../payment/strategies/paypal-commerce';
import { ConsignmentActionCreator } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethodInitializationData;
    private _isCredit?: boolean;
    private _currentShippingAddress?: CurrentShippingAddress;
    private _isVenmoEnabled?: boolean;
    private _isVenmo?: boolean;
    private _shippingData?: ShippingData;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _orderActionCreator: OrderActionCreator,
        private _countryActionCreator: CountryActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { isHostedCheckoutEnabled } = initializationData;

        if (!this._paymentMethod?.initializationData?.clientId) {
            throw new InvalidArgumentError();
        }
        await this._store.dispatch(this._countryActionCreator.loadCountries());
        await this._store.dispatch(this._consignmentActionCreator.loadShippingOptions());

        this._isVenmoEnabled = initializationData.isVenmoEnabled;
        const cart = state.cart.getCartOrThrow();

        const buttonParams: ButtonsOptions = {
            onApprove: (data: ApproveDataOptions, actions: ApproveActions) => this._onApproveHandler(data, actions, cart),
            onClick: data => this._handleClickButtonProvider(data),
            onCancel: (data, actions) => this._handleOnCancel(data, actions, cart),
            onShippingChange: (data, actions) => isHostedCheckoutEnabled && this._onShippingChangeHandler(data, actions, cart),
            style: options?.paypalCommerce?.style,
        };

        const messagingContainer = options.paypalCommerce?.messagingContainer;
        const isMessagesAvailable = Boolean(messagingContainer && document.getElementById(messagingContainer));

        await this._paypalCommercePaymentProcessor.initialize(this._getParamsScript(initializationData, cart), undefined, undefined, initializationData.isVenmoEnabled);

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

    private async _handleOnCancel(_data: any, _actions: any, cart: Cart) {
        const lineItems = this._collectLineItems(cart.lineItems);
        const existingConsignment = this._store.getState().consignments.getConsignmentsOrThrow();
        const { email } = this._store.getState().billingAddress.getBillingAddressOrThrow();
        const { firstName, lastName, address1 } = existingConsignment[0].shippingAddress;
        const shippingAddress = {
            ...this._shippingData,
            firstName: firstName !== 'Fake' ? firstName : '',
            lastName: lastName !== 'Fake' ? lastName: '',
            address1: address1 !== 'Fake street' ? address1 : '',
            email: email !== 'fake@fake.fake' ? email : '',
        };
        const consignment = [{
            shippingAddress,
            lineItems,
        }];
        await this._store.dispatch(this._billingAddressActionCreator.updateAddress(shippingAddress));
        await this._store.dispatch(this._consignmentActionCreator.deleteConsignment(existingConsignment[0].id));
        await this._store.dispatch(this._consignmentActionCreator.createConsignments(consignment));
    }

    private _onApproveHandler(data: ApproveDataOptions, actions: ApproveActions, cart: Cart) {
        const { isHostedCheckoutEnabled } = this._paymentMethod?.initializationData || {};

        return isHostedCheckoutEnabled
            ? this._onHostedMethodApprove(data, actions, cart)
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

    private async _onHostedMethodApprove(data: ApproveDataOptions, actions: ApproveActions, cart: Cart) {
            try {
                const orderDetails = await actions.order.get();
                const consignments = this._store.getState().consignments.getConsignmentsOrThrow();
                const lineItems = this._collectLineItems(cart.lineItems);
                const consignment = {
                    shippingAddress: {
                        ...this._currentShippingAddress,
                        firstName: orderDetails.payer.name.given_name,
                        lastName: orderDetails.payer.name.surname,
                        email: orderDetails.payer.email_address,
                        address1: orderDetails.purchase_units[0].shipping.address.address_line_1,
                    },
                    lineItems
                };
                await this._store.dispatch(this._billingAddressActionCreator.updateAddress(consignment.shippingAddress));
                await this._store.dispatch(this._consignmentActionCreator.updateConsignment({...consignment, id: consignments[0].id }));
                if (this._orderActionCreator) {
                    const submitOrderPayload = {};
                    const submitOrderOptions = {
                        params: {
                            methodId: this._paymentMethod?.id,
                        },
                    };
                    await this._store.dispatch(this._orderActionCreator.submitOrder(submitOrderPayload, submitOrderOptions));

                    const paymentData =  {
                        formattedPayload: {
                            vault_payment_instrument: null,
                            set_as_default_stored_instrument: null,
                            device_info: null,
                            method_id: this._paymentMethod?.id,
                            paypal_account: {
                                order_id: data.orderID,
                            },
                        },
                    };
                    await this._store.dispatch(this._paymentActionCreator.submitPayment({ ...{methodId: 'paypalcommerce'}, paymentData }));
                }
                window.location.assign('/checkout/order-confirmation');
            } catch (e) {
                throw new RequestError(e);
            }
    }

    private async _onShippingChangeHandler(data: ShippingChangeData, _actions: ApproveActions, cart: Cart) {
        const selectedShippingOption = data.selected_shipping_option;
        this._currentShippingAddress = await this._transformToAddress(data.shipping_address);
        const shippingAddress = this._currentShippingAddress;
        const lineItems = this._collectLineItems(cart.lineItems);
        const consignment = [{
            shippingAddress,
            lineItems,
        }];
        const existingConsignment = this._store.getState().consignments.getConsignmentsOrThrow();
        let createConsignment;
        let isSelectedOptionExist;

        if (!existingConsignment.length) {
            createConsignment = await this._store.dispatch(this._consignmentActionCreator.createConsignments(consignment));
        } else {
            await this._store.dispatch(this._consignmentActionCreator.deleteConsignment(existingConsignment[0].id));
            createConsignment = await this._store.dispatch(this._consignmentActionCreator.createConsignments(consignment));
        }
        const consignments = createConsignment.consignments.getConsignmentsOrThrow()[0];
        const availableShippingOptions = consignments.availableShippingOptions;
        const recommendedShippingOption = availableShippingOptions?.filter(option => option.isRecommended)[0];
        if (selectedShippingOption && selectedShippingOption.id) {
            isSelectedOptionExist = availableShippingOptions?.filter(option => option.id === selectedShippingOption.id).length;
        }
        await this._store.dispatch(this._billingAddressActionCreator.updateAddress(shippingAddress));
        await this._store.dispatch(this._consignmentActionCreator.updateConsignment({id: consignments.id, shippingOptionId: selectedShippingOption && isSelectedOptionExist ? selectedShippingOption.id : recommendedShippingOption?.id}));
        await this._paypalCommercePaymentProcessor.setShippingOptions({...data, cartId: cart.id, availableShippingOptions});
    }

    private _getUSStateByCode(code: string) {
        return  UNITED_STATES_CODES.find((state: UnitedStatesCodes) => {
            return state.name === code && state.abbreviation;
        });
    }

    private async _transformToAddress(contact: ShippingAddress) {
        let shippingData;
        const countries = this._store.getState().countries.getCountries();
        const addressCountry = countries?.find((country: Country) => (
            country.code === (contact.country_code || '').toUpperCase()));
        const stateAddress = addressCountry?.subdivisions.find((region: Region) => (
            region.code === contact.state?.toUpperCase() || region.code === this._getUSStateByCode(contact.state)?.abbreviation));
        const existingConsignment = this._store.getState().consignments.getConsignmentsOrThrow();

        if (!stateAddress && !contact.postal_code) {
            throw new InvalidArgumentError('Invalid Address');
        }

        if (existingConsignment && existingConsignment[0]) {
            const { firstName, lastName, address1, email } = existingConsignment[0].shippingAddress;
            shippingData = {
                city: contact.city,
                postalCode: stateAddress?.code || contact.postal_code,
                countryCode: contact.country_code,
                firstName: firstName ? firstName : 'Fake',
                lastName: lastName ? lastName :'Fake',
                address1: address1 ? address1 : 'Fake street',
                email: email ? email : 'fake@fake.fake'
            };
            this._shippingData = shippingData;
        } else {
            shippingData = {
                city: contact.city,
                postalCode: stateAddress?.code || contact.postal_code,
                countryCode: contact.country_code,
                firstName: 'Fake',
                lastName: 'Fake',
                address1: 'Fake street',
                email: 'fake@fake.fake'
            };
        }

        return shippingData;
    }

    private _collectLineItems(lineItems: LineItemMap): CollectedLineItem[] {
        const { digitalItems, physicalItems  } = lineItems;

        return [...digitalItems, ...physicalItems].map(({ id, quantity }) => ({
            itemId: id,
            quantity,
        }));
    }

    private _getParamsScript(initializationData: PaypalCommerceInitializationData, cart: Cart): PaypalCommerceScriptParams {
        const {
            clientId,
            intent,
            isPayPalCreditAvailable,
            merchantId,
            attributionId,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
            isVenmoEnabled,
            isHostedCheckoutEnabled,
        } = initializationData;

        const disableFunding: FundingType = [ 'card' ];
        const enableFunding: FundingType = enabledAlternativePaymentMethods.slice();

        /**
         *  The default value is different depending on the countries,
         *  therefore there's a need to add credit, paylater or APM name to enable/disable funding explicitly
         */
        availableAlternativePaymentMethods.forEach(apm => {
            if (!includes(enabledAlternativePaymentMethods, apm) && !isHostedCheckoutEnabled) {
                disableFunding.push(apm);
            } else {
                disableFunding.push(apm);
            }
        });

        if (isPayPalCreditAvailable) {
            enableFunding.push('credit', 'paylater');
        } else {
            disableFunding.push('credit', 'paylater');
        }

        if (isVenmoEnabled) {
            enableFunding.push('venmo');
        } else if (!enableFunding.includes('venmo')) {
            disableFunding.push('venmo');
        }

        return {
            'client-id': clientId,
            'merchant-id': merchantId,
            commit: !!isHostedCheckoutEnabled,
            currency: cart.currency.code,
            components: ['buttons', 'messages'],
            'disable-funding': disableFunding,
            ...(enableFunding.length && {'enable-funding': enableFunding}),
            intent,
            'data-partner-attribution-id': attributionId,
        };
    }
}
