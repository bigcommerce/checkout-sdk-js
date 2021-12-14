import { FormPoster } from '@bigcommerce/form-poster';
import { includes } from 'lodash';

import { Cart } from '../../../cart';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
// eslint-disable-next-line import/no-internal-modules
import PaymentActionCreator from '../../../payment/payment-action-creator';
import { ApproveDataOptions, ButtonsOptions, ClickDataOptions, FundingType, PaypalCommerceInitializationData, PaypalCommercePaymentProcessor, PaypalCommerceScriptParams } from '../../../payment/strategies/paypal-commerce';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class PaypalCommerceButtonStrategy implements CheckoutButtonStrategy {
    private _isCredit?: boolean;
    // private _onShippingChangeData?: any;
    // private _onShippingChangeActions?: any;
    private _cache?: any;
    private _submittedShippingAddress?: any;
    private _currentShippingAddress?: any;
    private _shippingOptionId?: any;
    private _addShipping?: any;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _formPoster: FormPoster,
        private _paypalCommercePaymentProcessor: PaypalCommercePaymentProcessor,
        // @ts-ignore
        private _orderActionCreator?: OrderActionCreator,
        // @ts-ignore
        private _paymentActionCreator?: PaymentActionCreator
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        let state = this._store.getState();
        const { initializationData } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const isHosted = true;
        this._cache = {};
        if (!initializationData.clientId) {
            throw new InvalidArgumentError();
        }

        state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const cart = state.cart.getCartOrThrow();
        const buttonParams: ButtonsOptions = {
            // @ts-ignore
            createOrder: (data: any, actions: any) => this._createOrder(data, actions),
            onApprove: (data: any, actions: any) => isHosted ? this._onApproveHandler( data, actions, cart) : this._tokenizePayment(data),
            onClick: data => this._handleClickButtonProvider(data),
            onShippingChange: (data, actions) => this._onShippingChangeHandler(data, actions, cart),
        };

        if (options.paypalCommerce && options.paypalCommerce.style) {
            buttonParams.style = options.paypalCommerce.style;
        }

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

    private _createOrder(data: any, actions: any) {
        console.log('ACTIONS', actions);
        console.log('DATA', data);

        return actions.order.create();
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

    private _transformContactToAddress(details: any, address: any) {
        const contact = {
            firstName: details.payer.name.given_name,
            lastName: details.payer.name.surname,
            email: details.payer.email_address,
            address1: details.purchase_units[0].shipping.address.address_line_1,
        };

        return  {
            ...address,
            ...contact,
        };
    }

    private async _onApproveHandler(_data: any, actions: any, cart: any) {
        const orderCapture = actions.order.capture()
            .then(async (details: any) => {
                if (this._currentShippingAddress) {
                    const shippingAddress = this._transformContactToAddress(details, this._currentShippingAddress);
                    // const lineItems = this._collectLineItems(cart.lineItems);
                    // const consignmentPayload = [{
                    //     shippingAddress,
                    //     lineItems,
                    // }];
                    // const checkoutWithShippingAddress = await this._paypalCommercePaymentProcessor.getConsignments(cart.id, consignmentPayload);
                    const checkoutWithBillingAddress = await this._paypalCommercePaymentProcessor.getBillingAddress(cart.id, shippingAddress);
                    // @ts-ignore
                    await this._paypalCommercePaymentProcessor.putConsignments(cart.id, checkoutWithBillingAddress.consignments[0].id, {shippingOptionId: this._shippingOptionId});
                }
                // const payload = {
                //     useStoreCredit: false,
                //     customerMessage: 'test message',
                //     payment: {
                //         name: 'paypalcommerce',
                //         paymentData: {
                //             additionalData: {
                //                 paypalOrderId: details.id,
                //                 status: details.status,
                //             },
                //         },
                //     },
                // };
                // PayPalCheckout.request('POST', PayPalCheckout.LEGACY_CHECKOUT_ENDPOINT + '/order', payload).then(function (details) {
                //     // alert('Order created with details:');
                //     console.log(details);
                //     window.location = '{{confirmationLink|raw}}';
                // }, function (err) {
                //     console.error(err);
                // });
            });
        // const paymentData =  {
        //     formattedPayload: {
        //         vault_payment_instrument: null,
        //         set_as_default_stored_instrument: null,
        //         device_info: null,
        //         method_id: 'paypalcommerce',
        //         paypal_account: {
        //             order_id: data.orderId,
        //         },
        //     },
        // };
        // if (this._orderActionCreator && this._paymentActionCreator) {
        //
        //     // @ts-ignore
        //     await this._store.dispatch(this._orderActionCreator.submitOrder(orderCapture, {methodId: 'paypalcommerce'}, this._onShippingChangeData));
        //
        //     this._store.dispatch(this._paymentActionCreator.submitPayment({ ...{methodId: 'paypalcommerce', gatewayId: undefined}, paymentData }));
        // }

        return orderCapture;
    }

    private async _onShippingChangeHandler(data: any, actions: any, cart: any) {
        // this._onShippingChangeData = data;
        // this._onShippingChangeActions = actions;
        const baseOrderAmount = cart.baseAmount;
        // @ts-ignore
        let shippingAmount = '0.00';
        this._currentShippingAddress = await this._transformToAddress(data.shipping_address);
        const lineItems = this._collectLineItems(cart.lineItems);
        const payload = [{
            shippingAddress: this._currentShippingAddress,
            lineItems,
        }];

        const checkout = await this._paypalCommercePaymentProcessor.getShippingOptions(cart.id, payload);
        // @ts-ignore
        const availableShippingOptions = checkout.consignments[0].availableShippingOptions;
        // @ts-ignore
        const shippingRequired = checkout.cart.lineItems.physicalItems.length > 0;
        if (!shippingRequired) {
            console.log('SHIPPING IS NOT REQUIRED', shippingRequired);

            return actions.order.patch([
                {
                    op: 'replace',
                    path: '/purchase_units/@reference_id==\'default\'/amount',
                    value: {
                        currency_code: 'USD',
                        value: (parseFloat(String(baseOrderAmount))).toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: baseOrderAmount,
                            },
                        },
                    },
                },
            ]);
            // If no shipping options returned, but shipping is required, do not allow to submit such order
        } else if (shippingRequired && availableShippingOptions.length === 0) {
            return actions.reject();
        } else {
            // @ts-ignore
            const shippingOptions = [];
            availableShippingOptions.forEach((option: any) => {
                // @ts-ignore
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
                        shippingAmount = parseFloat(option.cost).toFixed(2);
                        shippingAmount+=shippingAmount;
                        console.log('SHIPPING AMOUNT', shippingAmount);
                        isSelected = true;
                    }
                }
                shippingOptions.push({
                    id: option.id,
                    type: 'SHIPPING',
                    label: option.description,
                    selected: isSelected,
                    amount: {
                        value: parseFloat(option.cost).toFixed(2),
                        currency_code: 'USD',
                    },
                });
            });
            // `selected` should be always first element of shippingOptions array
            // @ts-ignore
            shippingOptions.sort( (a, b) => {
                return b.selected - a.selected;
            });
            // @ts-ignore
            if (shippingOptions && shippingOptions[0].id) {
                // @ts-ignore
                this._shippingOptionId = shippingOptions[0].id;
            }
            const shippingOperation = this._addShipping ? 'add' : 'replace';
            this._addShipping = false;
            this._submittedShippingAddress = this._currentShippingAddress;

            actions.order.patch([
                {
                    op: 'replace',
                    path: '/purchase_units/@reference_id==\'default\'/amount',
                    value: {
                        currency_code: 'USD',
                        value: (parseFloat(baseOrderAmount) + parseFloat(shippingAmount)).toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: baseOrderAmount,
                            },
                            shipping: {
                                currency_code: 'USD',
                                value: shippingAmount,
                            },
                        },
                    },
                },
                {
                    op: shippingOperation,
                    path: '/purchase_units/@reference_id==\'default\'/shipping/options',
                    // @ts-ignore
                    value: shippingOptions,
                },
            ]);

            return actions.resolve();
        }
    }

    private _isAddressSame(address1: any, address2: any) {
        return JSON.stringify(address1) === JSON.stringify(address2);
    }

    private async _transformToAddress(contact: any) {
        return (this._cache.countries ? Promise.resolve(this._cache.countries) : this._paypalCommercePaymentProcessor.getStoreCountries())
            .then((response: any) => {
                this._cache.countries = response;
                const address = {
                    city: contact.city,
                    postalCode: contact.postal_code,
                    countryCode: contact.country_code,
                };
                const country = response.data.find((country: any) => {
                    return country.code === (contact.country_code || '').toUpperCase();
                });
                const state = country && country.subdivisions.find((state: any) => {
                    return state.code === (contact.state || '').toUpperCase();
                });

                if (state) {
                    address.postalCode = state.code;
                } else {
                   console.log('Address Error');
                }

                return address;
            });
    }

    private _collectLineItems(lineItems: any) {
        const items: any[] = [];
        lineItems.physicalItems.forEach((item: any) => {
            items.push({itemId: item.id, quantity: item.quantity});
        });
        lineItems.digitalItems.forEach((item: any) => {
            items.push({itemId: item.id, quantity: item.quantity});
        });

        return items;
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
