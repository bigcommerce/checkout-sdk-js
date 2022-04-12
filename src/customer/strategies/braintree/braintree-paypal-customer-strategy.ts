import { FormPoster } from '@bigcommerce/form-poster';
import { noop, pick } from 'lodash';

import { Address, LegacyAddress } from '../../../address';
import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { CheckoutButtonMethodType } from '../../../checkout-buttons/strategies';
import { BraintreePaypalButtonStyles } from '../../../checkout-buttons/strategies/braintree';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { PaymentMethodClientUnavailableError } from '../../../payment/errors';
import { BraintreeShippingAddressOverride, BraintreeSDKCreator, BraintreeTokenizePayload, PaypalClientInstance, VenmoError, VenmoInstance } from '../../../payment/strategies/braintree';
import { PaypalAuthorizeData, PaypalHostWindow, PaypalSDK } from '../../../payment/strategies/paypal';
import { CustomerInitializeOptions, ExecutePaymentMethodCheckoutOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import BraintreePaypalCustomerInitializeOptions from './braintree-paypal-customer-initialize-options';

const venmoButtonStyle = {
    height: '40px',
    width: '150px',
    backgroundColor: '#3D95CE',
    backgroundPosition: '50% 50%',
    backgroundSize: '40%',
    backgroundImage: 'url("/app/assets/img/payment-providers/venmo-logo-white.svg")',
    borderRadius: '4px',
    backgroundRepeat: 'no-repeat',
    transition: '0.2s ease',
    cursor: 'pointer',
};

const venmoButtonStyleHover = {
    backgroundColor: '#0a7fc2',
};

export default class BraintreePaypalCustomerStrategy implements CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _paymentOptions?: BraintreePaypalCustomerInitializeOptions;
    private _onError = noop;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _braintreeSDKCreator: BraintreeSDKCreator,
        private _formPoster: FormPoster,
        private _offerCredit: boolean,
        private _window: PaypalHostWindow
    ) {}

    async initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintreepaypal, braintreepaypalcredit, methodId } = options;

        this._paymentOptions = this._offerCredit ? braintreepaypalcredit : braintreepaypal;
        this._onError = this._paymentOptions?.onError || noop;

        if (!methodId) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.methodId" argument is not provided.');
        }

        if (!this._paymentOptions) {
            throw new InvalidArgumentError(`Unable to initialize payment because "options.${methodId}" argument is not provided.`);
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
        const storeConfig = state.config.getStoreConfigOrThrow();
        const storeCurrency = storeConfig.shopperCurrency?.code;

        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        if (!this._paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeSDKCreator.initialize(this._paymentMethod.clientToken);

        await this._braintreeSDKCreator.getPaypalCheckout(
            { currency: storeCurrency },
            (paypalClientInstance: PaypalClientInstance): void =>
                this._renderPaypalButtons(paypalClientInstance)
        );

        await this._braintreeSDKCreator.getVenmoCheckout(
            { isBraintreeVenmoEnabled: this._paymentMethod.initializationData.isBraintreeVenmoEnabled },
            (venmoInstance: VenmoInstance): void =>
                this._renderVenmoButton(venmoInstance)
        );

        // Do I really need this one?
        // await this._braintreeSDKCreator.getPaypal();

        return Promise.resolve(this._store.getState());
    }

    // Default method
    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;
        this._paymentOptions = undefined;
        this._onError = noop;
        this._braintreeSDKCreator.teardown();

        return Promise.resolve(this._store.getState());
    }

    // Default method
    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via PayPal, the shopper must click on "PayPal" button.'
        );
    }

    // Default method
    signOut(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'Don\'t know what to do here yet'
        );
    }

    // Default method
    executePaymentMethodCheckout(options?: ExecutePaymentMethodCheckoutOptions): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _renderPaypalButtons(paypalClientInstance: PaypalClientInstance): void {
        const { container } = this._paymentOptions || {};
        const { config, initializationData } = this._paymentMethod || {};
        const { allowCredit, buttonStyle } = initializationData || {};
        const { testMode } = config || {};

        if (!container) {
            throw new InvalidArgumentError('Unable to initialize payment because "container" argument is not provided.');
        }

        const paypalSDK = this._getPaypalSDKOrThrow();
        const fundingSources = Object.keys(paypalSDK.FUNDING);
        const filteredFoundingSources = fundingSources.filter(fundingSource => !(
            (fundingSource === 'CREDIT' && !allowCredit)
            || (fundingSource === 'PAYLATER' && !allowCredit)
            || fundingSource === 'CARD'
        ));

        const validPaypalButtonStyle = this._getValidPaypalButtonStyle(buttonStyle);

        filteredFoundingSources.map(fundingSource => {
            const button = paypalSDK.Buttons({
                commit: false,
                env: testMode ? 'sandbox' : 'production',
                fundingSource: fundingSource.toLowerCase(),
                style: validPaypalButtonStyle,
                createOrder: () => this._setupPayment(paypalClientInstance),
                onApprove: (data: PaypalAuthorizeData) => this._tokenizePayment(data, paypalClientInstance),
            });

            if (button.isEligible()) {
                button.render(`#${container}`);
            }
        });
    }

    private _getPaypalSDKOrThrow(): PaypalSDK {
        const paypalSDK = this._window.paypal;

        if (!paypalSDK) {
            throw new PaymentMethodClientUnavailableError();
        }

        return paypalSDK;
    }

    private _getValidPaypalButtonStyle(buttonStyle?: BraintreePaypalButtonStyles): BraintreePaypalButtonStyles {
        if (!buttonStyle) {
            return { shape: 'rect' };
        }

        const validButtonStyles = pick(buttonStyle, 'layout', 'size', 'color', 'label', 'shape', 'tagline', 'fundingicons', 'height');
        const { height } = validButtonStyles;

        if (height && typeof height === 'number') {
            validButtonStyles.height = (height < 25 && 25) || (height > 55 && 55) || height;
        } else {
            delete validButtonStyles.height;
        }

        return validButtonStyles;
    }

    private async _setupPayment(paypalCheckoutInstance: PaypalClientInstance): Promise<string | void> {
        try {
            const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
            const checkout = state.checkout.getCheckoutOrThrow();
            const storeConfig = state.config.getStoreConfigOrThrow();
            const customer = state.customer.getCustomer();
            const shippingAddress = customer?.addresses?.[0]; // TODO: check customer address

            return await paypalCheckoutInstance.createPayment({
                flow: 'checkout',
                enableShippingAddress: true,
                shippingAddressEditable: false,
                shippingAddressOverride: shippingAddress ? this._mapToBraintreeAddress(shippingAddress) : undefined,
                amount: checkout.outstandingBalance,
                currency: storeConfig.currency.code,
                offerCredit: this._offerCredit,
            });
        } catch (error) {
            this._onError(error);
        }
    }

    private async _tokenizePayment(
        data: PaypalAuthorizeData,
        paypalCheckoutInstance: PaypalClientInstance
    ): Promise<void> {
        try {
            if (!this._paymentMethod?.id) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const payload = await paypalCheckoutInstance.tokenizePayment(data);

            await this._handlePostForm(payload, this._paymentMethod.id, true);
        } catch (error) {
            this._onError(error);
        }
    }

    private _renderVenmoButton(venmoInstance: VenmoInstance) {
        const { container } = this._paymentOptions || {};

        if (!container) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const venmoButton = document.createElement('div');
        venmoButton.setAttribute('id', 'venmo-button');
        venmoButton.setAttribute('aria-label', 'Venmo');
        Object.assign(venmoButton.style, venmoButtonStyle);

        const buttonParentContainer = document.getElementById(container);
        buttonParentContainer?.parentNode?.appendChild(venmoButton);

        venmoButton.addEventListener('click', () =>  {
            venmoButton.setAttribute('disabled', 'true');

            if (venmoInstance.tokenize) {
                try {
                    venmoInstance.tokenize(async (tokenizeErr: VenmoError, payload: BraintreeTokenizePayload) => {
                        venmoButton.removeAttribute('disabled');

                        if (tokenizeErr) {
                            return this._onError(tokenizeErr);
                        }

                        await this._handlePostForm(payload, CheckoutButtonMethodType.BRAINTREE_VENMO, false);
                    });
                } catch (error) {
                    this._onError(error);
                }
            }
        });

        venmoButton.addEventListener('mouseenter', () => {
            venmoButton.style.backgroundColor = venmoButtonStyleHover.backgroundColor;
        });

        venmoButton.addEventListener('mouseleave', () => {
            venmoButton.style.backgroundColor = venmoButtonStyle.backgroundColor;
        });
    }

    private async _handlePostForm(
        payload: BraintreeTokenizePayload,
        provider: string,
        isPaypal: boolean = false
    ): Promise<void> {
        const { deviceData } = await this._braintreeSDKCreator.getDataCollector({ paypal: isPaypal });

        await this._formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            provider,
            action: 'set_external_checkout',
            nonce: payload.nonce,
            device_data: deviceData,
            shipping_address: JSON.stringify(this._mapToLegacyShippingAddress(payload)),
            billing_address: JSON.stringify(this._mapToLegacyBillingAddress(payload)),
        });
    }

    private _mapToLegacyShippingAddress(payload: BraintreeTokenizePayload): Partial<LegacyAddress> {
        const { details } = payload;
        const { email, phone, shippingAddress } = details;

        const recipientName = shippingAddress?.recipientName || '';
        const [firstName, lastName] = recipientName.split(' ');

        return {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            address_line_1: shippingAddress?.line1,
            address_line_2: shippingAddress?.line2,
            city: shippingAddress?.city,
            state: shippingAddress?.state,
            country_code: shippingAddress?.countryCode,
            postal_code: shippingAddress?.postalCode,
        };
    }

    private _mapToLegacyBillingAddress(payload: BraintreeTokenizePayload): Partial<LegacyAddress> {
        const { details } = payload;
        const { billingAddress, email, firstName, lastName, phone, shippingAddress } = details;

        if (billingAddress) {
            return {
                email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                address_line_1: billingAddress.line1,
                address_line_2: billingAddress.line2,
                city: billingAddress.city,
                state: billingAddress.state,
                country_code: billingAddress.countryCode,
                postal_code: billingAddress.postalCode,
            };
        }

        return {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            address_line_1: shippingAddress?.line1,
            address_line_2: shippingAddress?.line2,
            city: shippingAddress?.city,
            state: shippingAddress?.state,
            country_code: shippingAddress?.countryCode,
            postal_code: shippingAddress?.postalCode,
        };
    }

    private _mapToBraintreeAddress(address: Address): BraintreeShippingAddressOverride {
        const { address1, address2, city, countryCode, firstName, lastName, phone, postalCode, stateOrProvinceCode } = address;

        return {
            city,
            countryCode,
            line1: address1,
            line2: address2,
            postalCode,
            phone,
            recipientName: `${firstName} ${lastName}`,
            state: stateOrProvinceCode,
        };
    }
}
