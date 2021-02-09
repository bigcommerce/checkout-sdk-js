import { some } from 'lodash';

import { Address } from '../../../address';
import { isBillingAddressLike, BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { Customer } from '../../../customer';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { getShippableItemsCount } from '../../../shipping';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import isIndividualCardElementOptions, { PaymentIntent, PaymentMethod as StripePaymentMethod, StripeAdditionalAction, StripeAdditionalActionError, StripeAddress, StripeBillingDetails, StripeCardElements, StripeConfirmCardPaymentData, StripeConfirmIdealPaymentData, StripeConfirmPaymentData, StripeConfirmSepaPaymentData, StripeElement, StripeElements, StripeElementOptions, StripeElementType, StripeError, StripePaymentMethodType, StripeShippingAddress, StripeV3Client } from './stripev3';
import StripeV3PaymentInitializeOptions from './stripev3-initialize-options';
import StripeV3ScriptLoader from './stripev3-script-loader';

export default class StripeV3PaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: PaymentInitializeOptions;
    private _stripeV3Client?: StripeV3Client;
    private _stripeElements?: StripeElements;
    private _stripeElement?: StripeElement;
    private _stripeCardElements?: StripeCardElements;
    private _useIndividualCardFields?: boolean;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeV3ScriptLoader,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _locale: string
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._initializeOptions = options;

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(this._getInitializeOptions().methodId);
        const { initializationData: { stripePublishableKey, stripeConnectedAccount, useIndividualCardFields } } = paymentMethod;

        this._useIndividualCardFields = useIndividualCardFields;
        this._stripeV3Client = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);
        this._stripeElement = await this._mountElement(this._getInitializeOptions().methodId);

        return Promise.resolve(this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;
        let paymentResult: PaymentIntent | StripePaymentMethod;
        let paymentPayload: any;

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { paymentData, gatewayId, methodId } = payment;
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } = paymentData as HostedInstrument;
        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const { isStoreCreditApplied : useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        if (isVaultedInstrument(paymentData)) {
            try {
                paymentPayload = {
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            bigpay_token: {
                                token: paymentData.instrumentId,
                            },
                            credit_card_number_confirmation: paymentData.ccNumber,
                            verification_value: paymentData.ccCvv,
                            confirm: false,
                        },
                        shouldSetAsDefaultInstrument,
                    },
                };

                return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            } catch (paymentError) {
                const isThreeDSecureRequiredError = paymentError instanceof RequestError &&
                    some(paymentError.body.errors, { code: 'three_d_secure_required' });

                if (!isThreeDSecureRequiredError) {
                    return Promise.reject(paymentError);
                }

                const clientSecret = paymentError.body.three_ds_result.token;

                paymentResult = await this._confirmVaultedPayment(clientSecret);

                if (!paymentResult.id) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
                }

                paymentPayload = {
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: paymentResult.id,
                            },
                            confirm: true,
                        },
                    },
                };
            }
        } else {
            const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(`${gatewayId}?method=${methodId}`));
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
            paymentResult = await this._confirmStripePayment(paymentMethod);

            if (!paymentResult.id) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
            }

            paymentPayload = {
                methodId,
                paymentData: {
                    formattedPayload: {
                        credit_card_token: {
                            token: paymentResult.id,
                        },
                        vault_payment_instrument: shouldSaveInstrument,
                        confirm: false,
                    },
                    shouldSetAsDefaultInstrument,
                },
            };
        }

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            return await this._processAdditionalAction(error, methodId, shouldSaveInstrument);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._unmountElement();

        return Promise.resolve(this._store.getState());
    }

    private async _processAdditionalAction(error: StripeAdditionalActionError, methodId: string, shouldSaveInstrument: boolean): Promise<any> {
        const isAdditionalActionError = some(error.body.errors, {code: 'additional_action_required'});
        const isThreeDSecureRequiredError = some(error.body.errors, { code: 'three_d_secure_required' });

        if (isAdditionalActionError) {
            const action: StripeAdditionalAction = error.body.additional_action_required;

            if (action && action.type === 'redirect_to_url') {
                return new Promise(() => {
                    if (action.data.redirect_url) {
                        window.location.replace(action.data.redirect_url);
                    }
                });
            }
        }

        if (isThreeDSecureRequiredError && error.body.three_ds_result) {
            return this._confirmVaultedPayment(error.body.three_ds_result.token).then(paymentIntent => {
                const paymentPayload = {
                    methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: paymentIntent.id,
                            },
                            confirm: true,
                            vault_payment_instrument: shouldSaveInstrument,
                        },
                    },
                };

                return this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            });
        }

        return Promise.reject(error);
    }

    private async _confirmStripePayment(paymentMethod: PaymentMethod): Promise<PaymentIntent | StripePaymentMethod> {
        const { clientToken: clientSecret, returnUrl } = paymentMethod;

        if (!clientSecret) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        let data;
        let error: StripeError | undefined;
        let paymentIntent: PaymentIntent | undefined;
        let stripePaymentMethod: StripePaymentMethod | undefined;

        return new Promise(async (resolve, reject) => {
            switch (paymentMethod.method) {
                case StripeElementType.Alipay:
                    ({error, paymentIntent} = await this._getStripeJs().confirmAlipayPayment(
                        clientSecret, { return_url: returnUrl }, { handleActions: false } ));

                    break;

                case StripeElementType.CreditCard:
                    const element: any = this._useIndividualCardFields ? this._getStripeCardElements()[0] : this._getStripeElement();
                    const customer = this._store.getState().customer.getCustomer();
                    const billingAddress = this._store.getState().billingAddress.getBillingAddress();
                    const billingDetails = this._mapStripeBillingDetails(billingAddress, customer);

                    ({error, paymentMethod: stripePaymentMethod} = await this._getStripeJs().createPaymentMethod(
                        {
                            type: StripePaymentMethodType.CreditCard,
                            card: element,
                            billing_details: billingDetails,
                        })
                    );

                    break;

                case StripeElementType.iDEAL:
                    data = this._mapStripePaymentData(StripePaymentMethodType.iDEAL, returnUrl);
                    ({error, paymentIntent} = await this._getStripeJs().confirmIdealPayment(
                        clientSecret, data, { handleActions: false }));

                    break;

                case StripeElementType.Sepa:
                    data = this._mapStripePaymentData(StripePaymentMethodType.Sepa);
                    ({error, paymentIntent} = await this._getStripeJs().confirmSepaDebitPayment(clientSecret, data));

                    break;
            }

            if (error) {
                reject(error);
            }

            if (paymentMethod.method === StripeElementType.CreditCard) {
                resolve(stripePaymentMethod);
            }

            resolve(paymentIntent);
        });
    }

    private async _confirmVaultedPayment(clientSecret: string): Promise<PaymentIntent> {
        return new Promise(async (resolve, reject) => {
            const { error, paymentIntent } = await this._getStripeJs().handleCardAction(clientSecret);

            if (error) {
                reject(error);
            }

            resolve(paymentIntent);
        });
    }

    private _getInitializeOptions(): PaymentInitializeOptions {
        if (!this._initializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._initializeOptions;
    }

    private _getStripeInitializeOptions(): StripeV3PaymentInitializeOptions {
        const { stripev3 } = this._getInitializeOptions();

        if (!stripev3) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.stripev3" argument is not provided.');
        }

        return stripev3;
    }

    private _getStripeElement(): StripeElement {
        if (!this._stripeElement) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeElement;
    }

    private _getStripeCardElements(): StripeCardElements {
        if (!this._stripeCardElements) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeCardElements;
    }

    private _getStripeJs(): StripeV3Client {
        if (!this._stripeV3Client) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._stripeV3Client;
    }

    private async _loadStripeJs(stripePublishableKey: string, stripeConnectedAccount: string): Promise<StripeV3Client> {
        if (this._stripeV3Client) { return Promise.resolve(this._stripeV3Client); }

        return await this._stripeScriptLoader.load(
            stripePublishableKey,
            stripeConnectedAccount,
            this._locale
        );
    }

    private _mountElement(methodId: string): Promise<StripeElement> {
        const stripeElementType = methodId as StripeElementType;
        const { options, containerId } = this._getStripeInitializeOptions();

        let stripeElement: StripeElement;

        return new Promise((resolve, reject) => {
            if (!this._stripeElements) {
                this._stripeElements = this._getStripeJs().elements();
            }

            switch (stripeElementType) {
                case StripeElementType.CreditCard:
                    if (this._useIndividualCardFields && isIndividualCardElementOptions(options)) {
                        const { cardNumberElementOptions, cardExpiryElementOptions, cardCvcElementOptions } = options;

                        const cardNumberElement = this._stripeElements.getElement(StripeElementType.CardNumber) || this._stripeElements.create(StripeElementType.CardNumber, cardNumberElementOptions);
                        const cardExpiryElement = this._stripeElements.getElement(StripeElementType.CardExpiry) || this._stripeElements.create(StripeElementType.CardExpiry, cardExpiryElementOptions);
                        const cardCvcElement = this._stripeElements.getElement(StripeElementType.CardCvc) || this._stripeElements.create(StripeElementType.CardCvc, cardCvcElementOptions);

                        this._stripeCardElements = [cardNumberElement, cardExpiryElement, cardCvcElement];
                        stripeElement = this._stripeCardElements[0];

                        try {
                            cardNumberElement.mount(`#${cardNumberElementOptions.containerId}`);
                            cardExpiryElement.mount(`#${cardExpiryElementOptions.containerId}`);
                            cardCvcElement.mount(`#${cardCvcElementOptions.containerId}`);
                        } catch (error) {
                            reject(new InvalidArgumentError('Unable to mount Stripe component without valid container ID.'));
                        }
                    } else {
                        stripeElement = this._stripeElements.getElement(stripeElementType) || this._stripeElements.create(stripeElementType, options as StripeElementOptions);

                        try {
                            stripeElement.mount(`#${containerId}`);
                        } catch (error) {
                            reject(new InvalidArgumentError('Unable to mount Stripe component without valid container ID.'));
                        }
                    }

                    break;
                case StripeElementType.iDEAL:
                case StripeElementType.Sepa:
                    stripeElement = this._stripeElements.getElement(stripeElementType) || this._stripeElements.create(stripeElementType, options as StripeElementOptions);

                    try {
                        stripeElement.mount(`#${containerId}`);
                    } catch (error) {
                        reject(new InvalidArgumentError('Unable to mount Stripe component without valid container ID.'));
                    }

                    break;

                case StripeElementType.Alipay:
                    break;
            }

            resolve(stripeElement);
        });
    }

    private _mapStripeAddress(address?: Address): StripeAddress {
        if (address) {
            const {
                city,
                countryCode: country,
                address1: line1,
                address2: line2,
                postalCode,
                stateOrProvinceCode: state,
            } = address;

            return { city, country, line1, line2, postal_code: postalCode, state };
        }

        return { line1: '' };
    }

    private _mapStripeBillingDetails(billingAddress?: BillingAddress, customer?: Customer): StripeBillingDetails {
        const { firstName, lastName } = billingAddress || customer || { firstName: 'Guest', lastName: '' };
        const name = `${firstName} ${lastName}`.trim();
        const { options } = this._getStripeInitializeOptions();

        if (this._useIndividualCardFields && isIndividualCardElementOptions(options)) {
            const { zipCodeElementOptions } = options;

            if (zipCodeElementOptions) {
                const postalCode = document.getElementById(zipCodeElementOptions.containerId) ? (document.getElementById(zipCodeElementOptions.containerId) as HTMLInputElement).value : '';

                if (postalCode && billingAddress) {
                    billingAddress = { ...billingAddress, postalCode };
                }
            }
        }

        const address = {
            address:  this._mapStripeAddress(billingAddress),
        };

        if (customer && customer.addresses[0] && isBillingAddressLike(customer.addresses[0])) {
            const customerAddress = customer.addresses[0];
            const { email } = customer;
            const { phone } = customerAddress;

            return phone ? { ...address, email, name, phone } : { ...address, email, name };
        }

        if (billingAddress) {
            const { email, phone } = billingAddress;

            return phone ? { ...address, email, name, phone } : { ...address, email, name };
        }

        return { ...address, name };
    }

    private _mapStripePaymentData(element: StripePaymentMethodType.CreditCard, shouldSaveInstrument: boolean): StripeConfirmCardPaymentData;
    private _mapStripePaymentData(element: StripePaymentMethodType.iDEAL, returnUrl?: string): StripeConfirmIdealPaymentData;
    private _mapStripePaymentData(element: StripePaymentMethodType.Sepa): StripeConfirmSepaPaymentData;
    private _mapStripePaymentData(element: StripePaymentMethodType, arg2?: any): StripeConfirmPaymentData {
        const customer = this._store.getState().customer.getCustomer();
        const billingAddress = this._store.getState().billingAddress.getBillingAddress();
        let result: Partial<StripeConfirmPaymentData>;

        result = {
            payment_method: {
                [element]: element === StripePaymentMethodType.CreditCard && this._useIndividualCardFields ? this._getStripeCardElements()[0] : this._getStripeElement(),
                billing_details: this._mapStripeBillingDetails(billingAddress, customer),
            },
        };

        switch (element) {
            case StripePaymentMethodType.CreditCard:
                const cart = this._store.getState().cart.getCart();

                if (cart && getShippableItemsCount(cart) > 0) {
                    const shippingAddress = this._store.getState().shippingAddress.getShippingAddress();
                    result = { ...result, shipping: this._mapStripeShippingAddress(shippingAddress, customer) };
                }

                return arg2 ? { ...result, setup_future_usage: 'off_session' } : result;

            case StripePaymentMethodType.iDEAL:
                return { ...result, return_url: arg2 };

        }

        return result;
    }

    private _mapStripeShippingAddress(shippingAddress?: Address, customer?: Customer): StripeShippingAddress {
        const { firstName, lastName } = shippingAddress || customer || { firstName: 'Guest', lastName: '' };
        const name = `${firstName} ${lastName}`.trim();

        const address = {
            address:  this._mapStripeAddress(shippingAddress),
        };

        if (customer && customer.addresses[0]) {
            const customerAddress = customer.addresses[0];
            const { phone } = customerAddress;

            return { ...address, name, phone };
        }

        if (shippingAddress) {
            const { phone } = shippingAddress;

            return {...address, name, phone};
        }

        return {...address, name};
    }

    private _unmountElement(): void {
        if (this._stripeElement) {
            this._stripeElement.unmount();
            this._stripeElement = undefined;
        }
    }
}
