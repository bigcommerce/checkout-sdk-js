import { includes, some } from 'lodash';

import { Payment } from '../..';
import { Address } from '../../../address';
import { isBillingAddressLike, BillingAddress } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { Customer } from '../../../customer';
import { HostedForm, HostedFormFactory, HostedFormOptions } from '../../../hosted-form';
import { InvalidHostedFormError } from '../../../hosted-form/errors';
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

import isIndividualCardElementOptions, { PaymentIntent, PaymentMethod as StripePaymentMethod, StripeAdditionalAction, StripeAddress, StripeBillingDetails, StripeCardElements, StripeConfirmCardPaymentData, StripeConfirmIdealPaymentData, StripeConfirmPaymentData, StripeConfirmSepaPaymentData, StripeElement, StripeElements, StripeElementOptions, StripeElementType, StripeError, StripePaymentMethodType, StripeShippingAddress, StripeV3Client } from './stripev3';
import StripeV3PaymentInitializeOptions from './stripev3-initialize-options';
import StripeV3ScriptLoader from './stripev3-script-loader';

const APM_REDIRECT = [StripeElementType.Alipay, StripeElementType.iDEAL];

export default class StripeV3PaymentStrategy implements PaymentStrategy {
    private _initializeOptions?: PaymentInitializeOptions;
    private _stripeV3Client?: StripeV3Client;
    private _stripeElements?: StripeElements;
    private _stripeElement?: StripeElement;
    private _stripeCardElements?: StripeCardElements;
    private _useIndividualCardFields?: boolean;
    private _hostedForm?: HostedForm;
    private _shouldRenderHostedForm?: boolean;
    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _stripeScriptLoader: StripeV3ScriptLoader,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _hostedFormFactory: HostedFormFactory,
        private _locale: string
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._initializeOptions = options;
        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(this._getInitializeOptions().methodId);
        const { initializationData: { stripePublishableKey, stripeConnectedAccount, useIndividualCardFields } } = paymentMethod;

        this._useIndividualCardFields = useIndividualCardFields;
        this._stripeV3Client = await this._loadStripeJs(stripePublishableKey, stripeConnectedAccount);
        this._stripeElement = await this._mountElement(this._getInitializeOptions().methodId);

        if (StripePaymentMethodType.CreditCard &&
            this._isHostedPaymentFormEnabled(this._getInitializeOptions().methodId, this._getInitializeOptions().gatewayId) &&
            this._isHostedFieldAvailable() && options.stripev3 && options.stripev3.form) {
            await this._mountCardVerificationfields(options.stripev3.form);
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;
        let formattedPayload: { [key: string]: any };
        let stripeError: StripeError | undefined;

        if (!payment || !payment.paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const { paymentData, gatewayId, methodId } = payment;
        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } = paymentData as HostedInstrument;
        const shouldSubmitOrderBeforeLoadingAPM = includes(APM_REDIRECT, methodId);

        const { isStoreCreditApplied : useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        if (isVaultedInstrument(paymentData)) {
            // tslint:disable-next-line: variable-name
            const { instrumentId: token, ccNumber: credit_card_number_confirmation, ccCvv: verification_value } = paymentData;

            if (this._isHostedPaymentFormEnabled(methodId, gatewayId) && this._shouldRenderHostedForm) {
                const form = this._hostedForm;

                if (!form) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                try {
                    await form.validate();
                } catch (error) {
                    if (error instanceof InvalidHostedFormError) {
                        return Promise.reject(error);
                    }

                    throw new Error(error.message);
                }
            }

            formattedPayload = {
                bigpay_token: { token },
                credit_card_number_confirmation,
                verification_value,
                confirm: false,
            };
        } else {
            if (shouldSubmitOrderBeforeLoadingAPM) {
                await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
            }
            const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(`${gatewayId}?method=${methodId}`));
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
            const result = await this._confirmStripePayment(paymentMethod);
            const { clientToken, method } = paymentMethod;
            const { id: token } = result.paymentIntent ?? result.paymentMethod ?? { id: '' };
            stripeError = result.error;

            formattedPayload = {
                credit_card_token: { token },
                vault_payment_instrument: shouldSaveInstrument,
                confirm: false,
            };

            if (method === StripeElementType.CreditCard) {
                formattedPayload.client_token = clientToken;
            }
        }

        if (!shouldSubmitOrderBeforeLoadingAPM) {
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        }

        const paymentPayload = this._buildPaymentPayload(methodId, formattedPayload, shouldSetAsDefaultInstrument);

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            return await this._processAdditionalAction(
                this._handleEmptyPaymentIntentError(error, stripeError),
                methodId,
                shouldSaveInstrument,
                shouldSetAsDefaultInstrument
            );
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._unmountElement();

        return Promise.resolve(this._store.getState());
    }

    private _buildPaymentPayload(methodId: string, formattedPayload: { [key: string]: any }, shouldSetAsDefaultInstrument: boolean): Payment {
        const paymentData = shouldSetAsDefaultInstrument
            ? { formattedPayload, shouldSetAsDefaultInstrument }
            : { formattedPayload };

        return { methodId, paymentData };
    }

    private async _processAdditionalAction(
        error: Error,
        methodId: string,
        shouldSaveInstrument: boolean,
        shouldSetAsDefaultInstrument: boolean
    ): Promise<InternalCheckoutSelectors | never> {
        if (!(error instanceof RequestError)) {
            throw error;
        }

        const isAdditionalActionError = some(error.body.errors, { code: 'additional_action_required' });
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

        if (isThreeDSecureRequiredError) {
            const clientSecret = error.body.three_ds_result.token;
            const result = await this._getStripeJs().handleCardAction(clientSecret);
            const { id: token } = result.paymentIntent || { id: '' };

            const formattedPayload = {
                credit_card_token: { token },
                vault_payment_instrument: shouldSaveInstrument,
                confirm: true,
            };

            const paymentPayload = this._buildPaymentPayload(methodId, formattedPayload, shouldSetAsDefaultInstrument);

            try {
                return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
            } catch (error) {
                throw this._handleEmptyPaymentIntentError(error, result.error);
            }
        }

        throw error;
    }

    private _handleEmptyPaymentIntentError(
        error: Error,
        stripeError: StripeError | undefined
    ) {
        if (!(error instanceof RequestError)) {
            return error;
        }

        return some(error.body.errors, { code: 'required_field' }) && stripeError
            ? new Error(stripeError.message)
            : error;
    }

    private async _confirmStripePayment(paymentMethod: PaymentMethod): Promise<{
        paymentIntent?: PaymentIntent | undefined;
        paymentMethod?: StripePaymentMethod | undefined;
        error?: StripeError | undefined;
    }> {
        const { clientToken: clientSecret, method, returnUrl } = paymentMethod;

        if (!clientSecret) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        switch (method) {
            case StripeElementType.Alipay:
                return await this._getStripeJs().confirmAlipayPayment(clientSecret, { return_url: returnUrl }, { handleActions: false } );

            case StripeElementType.CreditCard: {
                const card = this._useIndividualCardFields ? this._getStripeCardElements()[0] : this._getStripeElement();
                const billingDetails = this._mapStripeBillingDetails(
                    this._store.getState().billingAddress.getBillingAddress(),
                    this._store.getState().customer.getCustomer()
                );

                return await this._getStripeJs().createPaymentMethod({
                    type: StripePaymentMethodType.CreditCard,
                    card,
                    billing_details: billingDetails,
                });
            }

            case StripeElementType.iDEAL: {
                const data = this._mapStripePaymentData(StripePaymentMethodType.iDEAL, returnUrl);

                return await this._getStripeJs().confirmIdealPayment(clientSecret, data, { handleActions: false });
            }

            case StripeElementType.Sepa: {
                const data = this._mapStripePaymentData(StripePaymentMethodType.Sepa);

                return await this._getStripeJs().confirmSepaDebitPayment(clientSecret, data);
            }

            default:
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }
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

    private async _mountCardVerificationfields(formOptions: HostedFormOptions) {

        if (!formOptions) {
            throw new InvalidArgumentError();
        }

        const { config } = this._store.getState();
        const { paymentSettings: { bigpayBaseUrl: host = '' } = {} } = config.getStoreConfig() || {};

        const form = this._hostedFormFactory.create(host, formOptions);
        await form.attach();
        this._shouldRenderHostedForm = true;
        this._hostedForm = form;
    }

    private _isHostedPaymentFormEnabled(methodId: string, gatewayId?: string): boolean {
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private _isHostedFieldAvailable(): boolean {
        const options = this._getInitializeOptions();

        return (options.stripev3?.form && options.stripev3.form.fields) ? true : false;
    }
}
