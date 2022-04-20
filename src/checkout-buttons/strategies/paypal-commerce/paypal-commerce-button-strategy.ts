import { FormPoster } from '@bigcommerce/form-poster';
import { includes } from 'lodash';

import { BillingAddressActionCreator } from '../../../billing/';
import { Cart, CollectedLineItem, LineItemMap } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { Country, CountryActionCreator, Region, UnitedStatesCodes, UNITED_STATES_CODES } from '../../../geography';
import { OrderActionCreator } from '../../../order';
import { PaymentActionCreator } from '../../../payment/';
import { ApproveActions, ApproveDataOptions, AvaliableShippingOption, ButtonsOptions, ClickDataOptions, CurrentShippingAddress, FundingType, PaymentMethodInitializationData, PaypalCommerceInitializationData, PaypalCommercePaymentProcessor, PaypalCommerceScriptParams, ShippingAddress, ShippingChangeData } from '../../../payment/strategies/paypal-commerce';
import { ConsignmentActionCreator } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _paymentMethod?: PaymentMethodInitializationData;
    private _isCredit?: boolean;
    private _submittedShippingAddress?: CurrentShippingAddress;
    private _currentShippingAddress?: CurrentShippingAddress;
    private _selectedShippingOptionId?: string;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        private _orderActionCreator: OrderActionCreator,
        private _countryActionCreator: CountryActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _paymentActionCreator: PaymentActionCreator
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        if (!this._paymentMethod?.initializationData?.clientId) {
            throw new InvalidArgumentError();
        }
        await this._store.dispatch(this._countryActionCreator.loadCountries());
        await this._store.dispatch(this._consignmentActionCreator.loadShippingOptions());

        const cart = state.cart.getCartOrThrow();

        const buttonParams: ButtonsOptions = {
            onApprove: (data: ApproveDataOptions, actions: ApproveActions) => this._onApproveHandler( data, actions, cart),
            onClick: data => this._handleClickButtonProvider(data),
            onShippingChange: (data, actions) => this._onShippingChangeHandler(data, actions, cart),
            style: options?.paypalCommerce?.style,
        };

        const messagingContainer = options.paypalCommerce?.messagingContainer;
        const isMessagesAvailable = Boolean(messagingContainer && document.getElementById(messagingContainer));

        await this._paypalCommercePaymentProcessor.initialize(this._getParamsScript(initializationData, cart));

        this._paypalCommercePaymentProcessor.renderButtons(cart.id, `#${options.containerId}`, buttonParams);

        if (isMessagesAvailable) {
            this._paypalCommercePaymentProcessor.renderMessages(cart.cartAmount, `#${messagingContainer}`);
        }

        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        this._isCredit = undefined;

        return Promise.resolve();
    }

    private _onApproveHandler(data: ApproveDataOptions, actions: ApproveActions, cart: Cart) {
        const { isHosted = true } = this._paymentMethod?.initializationData || {};

        return isHosted
            ? this._onHostedMethodApprove(data, actions, cart)
            : this._tokenizePayment(data);
    }

    private _handleClickButtonProvider({ fundingSource }: ClickDataOptions): void {
        this._isCredit = fundingSource === 'credit' || fundingSource === 'paylater';
    }

    private _tokenizePayment({ orderID }: ApproveDataOptions) {
        if (!orderID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        return this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            action: 'set_external_checkout',
            provider: this._isCredit ? 'paypalcommercecredit' : 'paypalcommerce',
            order_id: orderID,
        });
    }

    private async _onHostedMethodApprove(data: ApproveDataOptions, actions: ApproveActions, cart: Cart) {
        if (this._currentShippingAddress) {
            try {
                const orderDetails = await actions.order.get();
                const shippingAddress = {
                    ...this._currentShippingAddress,
                    firstName: orderDetails.payer.name.given_name,
                    lastName: orderDetails.payer.name.surname,
                    email: orderDetails.payer.email_address,
                    address1: orderDetails.purchase_units[0].shipping.address.address_line_1,
                };
                const lineItems = this._collectLineItems(cart.lineItems);
                const consignment = [{
                    shippingAddress,
                    lineItems,
                }];
                await this._store.dispatch(this._consignmentActionCreator.createConsignments(consignment));
                const updatedBillingAddress = await this._store.dispatch(this._billingAddressActionCreator.updateAddress(shippingAddress));
                const consignments = updatedBillingAddress.consignments.getConsignmentsOrThrow();

                if (consignments && this._selectedShippingOptionId) {
                    await this._store.dispatch(this._consignmentActionCreator.updateConsignment({id: consignments[0].id, shippingOptionId: this._selectedShippingOptionId}));
                }
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

    }

    private async _onShippingChangeHandler(data: ShippingChangeData, actions: ApproveActions, cart: Cart) {
        const baseOrderAmount = cart.baseAmount;
        let shippingAmount = '0.00';
        this._currentShippingAddress = await this._transformToAddress(data.shipping_address);
        const lineItems = this._collectLineItems(cart.lineItems);
        const consignment = [{
            shippingAddress: {...this._currentShippingAddress},
            lineItems,
        }];
        await this._store.dispatch(this._consignmentActionCreator.createConsignments(consignment));
        const checkout = this._store.getState().checkout.getCheckoutOrThrow();
        const availableShippingOptions = checkout.consignments[0].availableShippingOptions;
        const shippingRequired = checkout.cart.lineItems.physicalItems.length > 0;
        if (!shippingRequired) {
            return await actions.order.patch([
                {
                    op: 'replace',
                    path: '/purchase_units/@reference_id==\'default\'/amount',
                    value: {
                        currency_code: checkout.cart.currency.code,
                        value: (parseFloat(String(baseOrderAmount))).toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: checkout.cart.currency.code,
                                value: baseOrderAmount,
                            },
                        },
                    },
                },
            ]);
        }

        if (shippingRequired && availableShippingOptions?.length === 0) {
            return actions.reject();
        }

        const shippingOptions = availableShippingOptions?.map((option: AvaliableShippingOption) => {
            let isSelected = false;
            // Buyer has chosen shipping option on PP list and address the same
            if (data.selected_shipping_option && this._isAddressSame(
                this._currentShippingAddress, this._submittedShippingAddress
            )) {
                if (option.id === data.selected_shipping_option.id) {
                    shippingAmount = data.selected_shipping_option.amount.value;
                    isSelected = true;
                }
            } else {
                if (option.isRecommended) {
                    shippingAmount = parseFloat(String(option.cost)).toFixed(2);
                    isSelected = true;
                }
            }

            return {
                id: option.id,
                type: 'SHIPPING',
                label: option.description,
                selected: isSelected,
                amount: {
                    value: parseFloat(String(option.cost)).toFixed(2),
                    currency_code: checkout.cart.currency.code,
                },
            };
        });

        shippingOptions?.sort( (a, b) => {
            return (a.selected === b.selected) ? 0 : a ? -1 : 1;
        });
        if (shippingOptions) {
            this._selectedShippingOptionId = shippingOptions.find(option => option.selected)?.id;
        }

        this._submittedShippingAddress = this._currentShippingAddress;

        if (shippingOptions && this._selectedShippingOptionId) {
            return actions.order.patch([
                {
                    op: 'replace',
                    path: '/purchase_units/@reference_id==\'default\'/amount',
                    value: {
                        currency_code: checkout.cart.currency.code,
                        value: (parseFloat(String(baseOrderAmount)) + parseFloat(shippingAmount)).toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: checkout.cart.currency.code,
                                value: baseOrderAmount,
                            },
                            shipping: {
                                currency_code: checkout.cart.currency.code,
                                value: shippingAmount,
                            },
                        },
                    },
                },
                {
                    op: 'add',
                    path: '/purchase_units/@reference_id==\'default\'/shipping/options',
                    value: shippingOptions,
                },
            ]);
        }
    }

    private _isAddressSame(address1: CurrentShippingAddress | undefined, address2: CurrentShippingAddress | undefined) {
        return JSON.stringify(address1) === JSON.stringify(address2);
    }

    private _getUSStateByCode(code: string) {
       return  UNITED_STATES_CODES.find((state: UnitedStatesCodes) => {
            return state.name === code && state.abbreviation;
        });
    }

    private async _transformToAddress(contact: ShippingAddress) {
        const countries = this._store.getState().countries.getCountries();
        const addressCountry = countries?.find((country: Country) => (
            country.code === (contact.country_code || '').toUpperCase()));
        const stateAddress = addressCountry?.subdivisions.find((region: Region) => (
            region.code === contact.state?.toUpperCase() || region.code === this._getUSStateByCode(contact.state)?.abbreviation));

        if (!stateAddress && !contact.postal_code) {
            throw new InvalidArgumentError('Invalid Address');
        }

        return {
            city: contact.city,
            postalCode: stateAddress?.code || contact.postal_code,
            countryCode: contact.country_code,
        };
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
        } = initializationData;

        const disableFunding: FundingType = [ 'card' ];
        const enableFunding: FundingType = enabledAlternativePaymentMethods.slice();

        /**
         *  The default value is different depending on the countries,
         *  therefore there's a need to add credit, paylater or APM name to enable/disable funding explicitly
         */
        availableAlternativePaymentMethods.forEach(apm => {
            if (!includes(enabledAlternativePaymentMethods, apm)) {
                disableFunding.push(apm);
            }
        });

        if (isPayPalCreditAvailable) {
            enableFunding.push('credit', 'paylater');
        } else {
            disableFunding.push('credit', 'paylater');
        }

        return {
            'client-id': clientId,
            'merchant-id': merchantId,
            commit: false,
            currency: cart.currency.code,
            components: ['buttons', 'messages'],
            'disable-funding': disableFunding,
            ...(enableFunding.length && {'enable-funding': enableFunding}),
            intent,
            'data-partner-attribution-id': attributionId,
        };
    }
}
