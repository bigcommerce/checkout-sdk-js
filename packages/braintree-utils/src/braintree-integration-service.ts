import { supportsPopups } from '@braintree/browser-detection';

import {
    Address,
    CancellablePromise,
    CreditCardInstrument,
    LegacyAddress,
    NonceInstrument,
    NotInitializedError,
    NotInitializedErrorType,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInvalidFormError,
    PaymentInvalidFormErrorDetails,
    PaymentMethodCancelledError,
    UnsupportedBrowserError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { Overlay } from '@bigcommerce/checkout-sdk/ui';

import BraintreeScriptLoader from './braintree-script-loader';
import {
    BraintreeClient,
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig,
    BraintreeDataCollectors,
    BraintreeEnv,
    BraintreeError,
    BraintreeFastlane,
    BraintreeFastlaneStylesOption,
    BraintreeHostWindow,
    BraintreeModule,
    BraintreePaypal,
    BraintreePaypalCheckout,
    BraintreePaypalSdkCreatorConfig,
    BraintreeRequestData,
    BraintreeShippingAddressOverride,
    BraintreeThreeDSecure,
    BraintreeThreeDSecureOptions,
    BraintreeTokenizationDetails,
    BraintreeTokenizePayload,
    BraintreeVenmoCheckout,
    BraintreeVenmoCreatorConfig,
    BraintreeVerifyPayload,
    PAYPAL_COMPONENTS,
    TokenizationPayload,
} from './types';
import isBraintreeError from './utils/is-braintree-error';
import { isEmpty } from 'lodash';
import isCreditCardInstrumentLike from './utils/is-credit-card-instrument-like';

export interface PaypalConfig {
    amount: number;
    currency: string;
    locale: string;
    offerCredit?: boolean;
    shippingAddressEditable?: boolean;
    shippingAddressOverride?: BraintreeShippingAddressOverride;
    shouldSaveInstrument?: boolean;
}

// Info: this class is deprecated and will be removed in a nearest future. Please, do not add anything here.
export default class BraintreeIntegrationService {
    private client?: Promise<BraintreeClient>;
    private clientToken?: string;
    private dataCollectors: BraintreeDataCollectors = {};
    private paypalCheckout?: BraintreePaypalCheckout;
    private braintreePaypal?: Promise<BraintreePaypal>;
    private threeDSecureOptions?: BraintreeThreeDSecureOptions;
    private threeDS?: Promise<BraintreeThreeDSecure>;
    private venmoCheckout?: BraintreeVenmoCheckout;

    constructor(
        private braintreeScriptLoader: BraintreeScriptLoader,
        private braintreeHostWindow: BraintreeHostWindow,
        private overlay?: Overlay,
    ) {}

    initialize(clientToken: string, threeDSecureOptions?: BraintreeThreeDSecureOptions) {
        this.clientToken = clientToken;
        this.threeDSecureOptions = threeDSecureOptions;
    }

    async getBraintreeFastlane(
        cardId?: string,
        isTestModeEnabled?: boolean,
        styles?: BraintreeFastlaneStylesOption,
    ): Promise<BraintreeFastlane> {
        if (isTestModeEnabled) {
            window.localStorage.setItem('axoEnv', 'sandbox');
            window.localStorage.setItem('fastlaneEnv', 'sandbox');
        }

        if (!this.braintreeHostWindow.braintreeFastlane) {
            const clientToken = this.getClientTokenOrThrow();
            const client = await this.getClient();
            const deviceData = await this.getSessionId(cardId);

            const braintreeFastlaneCreator = await this.braintreeScriptLoader.loadFastlane();

            const defaultStyles = {
                root: {
                    backgroundColorPrimary: 'transparent',
                },
            };

            this.braintreeHostWindow.braintreeFastlane = await braintreeFastlaneCreator.create({
                authorization: clientToken,
                client,
                deviceData,
                styles: styles || defaultStyles,
            });
        }

        return this.braintreeHostWindow.braintreeFastlane;
    }

    // Info: This method is deprecated. Use getClient method from BraintreeSdk class instead
    async getClient(): Promise<BraintreeClient> {
        if (!this.client) {
            const clientToken = this.getClientTokenOrThrow();
            const clientCreator = await this.braintreeScriptLoader.loadClient();

            this.client = clientCreator.create({ authorization: clientToken });
        }

        return this.client;
    }

    getPaypal(): Promise<BraintreePaypal> {
        if (!this.braintreePaypal) {
            this.braintreePaypal = Promise.all([
                this.getClient(),
                this.braintreeScriptLoader.loadPaypal(),
            ]).then(([client, paypal]) => paypal.create({ client }));
        }

        return this.braintreePaypal;
    }

    paypal({ shouldSaveInstrument, ...config }: PaypalConfig): Promise<BraintreeTokenizePayload> {
        const newWindowFlow = supportsPopups();

        return this.getPaypal()
            .then((paypal) => {
                if (newWindowFlow) {
                    this.overlay?.show({
                        onClick: () => paypal.focusWindow(),
                    });
                }

                return paypal.tokenize({
                    enableShippingAddress: true,
                    flow: shouldSaveInstrument ? 'vault' : 'checkout',
                    useraction: 'commit',
                    ...config,
                });
            })
            .then((response) => {
                this.overlay?.remove();

                return response;
            })
            .catch((error) => {
                this.overlay?.remove();

                throw error;
            });
    }

    async getPaypalCheckout(
        config: Partial<BraintreePaypalSdkCreatorConfig>,
        onSuccess: (instance: BraintreePaypalCheckout) => void,
        onError: (error: BraintreeError) => void,
    ): Promise<BraintreePaypalCheckout> {
        const client = await this.getClient();
        const paypalCheckout = await this.braintreeScriptLoader.loadPaypalCheckout();

        const paypalCheckoutConfig = { client };
        const paypalCheckoutCallback = (
            error: BraintreeError | undefined,
            braintreePaypalCheckout: BraintreePaypalCheckout,
        ) => {
            if (error) {
                return onError(error);
            }

            const paypalSdkLoadCallback = () => onSuccess(braintreePaypalCheckout);
            const paypalSdkLoadConfig = {
                currency: config.currency,
                ...(config.isCreditEnabled && { 'enable-funding': 'paylater' }),
                components: PAYPAL_COMPONENTS.toString(),
                intent: config.intent,
                commit: config.commit ?? true,
            };

            if (!this.braintreeHostWindow.paypal) {
                braintreePaypalCheckout.loadPayPalSDK(paypalSdkLoadConfig, paypalSdkLoadCallback);
            } else {
                onSuccess(braintreePaypalCheckout);
            }
        };

        this.paypalCheckout = await paypalCheckout.create(
            paypalCheckoutConfig,
            paypalCheckoutCallback,
        );

        return this.paypalCheckout;
    }

    async getDataCollector(
        options?: Partial<BraintreeDataCollectorCreatorConfig>,
    ): Promise<BraintreeDataCollector> {
        const cacheKey: keyof BraintreeDataCollectors = options?.paypal ? 'paypal' : 'default';

        let cached = this.dataCollectors[cacheKey];

        if (!cached) {
            try {
                const client = await this.getClient();
                const dataCollector = await this.braintreeScriptLoader.loadDataCollector();

                const dataCollectorConfig: BraintreeDataCollectorCreatorConfig = {
                    client,
                    kount: true,
                    ...options,
                };

                cached = await dataCollector.create(dataCollectorConfig);
            } catch (error) {
                if (isBraintreeError(error) && error.code === 'DATA_COLLECTOR_KOUNT_NOT_ENABLED') {
                    cached = {
                        deviceData: undefined,
                        teardown: () => Promise.resolve(),
                    };
                } else {
                    throw error;
                }
            }

            this.dataCollectors[cacheKey] = cached;
        }

        return cached;
    }

    getBraintreeEnv(isTestMode = false): BraintreeEnv {
        return isTestMode ? BraintreeEnv.Sandbox : BraintreeEnv.Production;
    }

    mapToBraintreeShippingAddressOverride(address: Address): BraintreeShippingAddressOverride {
        return {
            recipientName: `${address.firstName} ${address.lastName}`,
            line1: address.address1,
            line2: address.address2,
            city: address.city,
            state: address.stateOrProvinceCode,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            phone: address.phone,
        };
    }

    mapToLegacyShippingAddress(details: BraintreeTokenizationDetails): Partial<LegacyAddress> {
        const { email, phone, shippingAddress } = details;
        const recipientName = shippingAddress?.recipientName || '';
        const [firstName, lastName] = recipientName.split(' ');

        return {
            email,
            first_name: firstName || '',
            last_name: lastName || '',
            phone_number: phone,
            address_line_1: shippingAddress?.line1,
            address_line_2: shippingAddress?.line2,
            city: shippingAddress?.city,
            state: shippingAddress?.state,
            country_code: shippingAddress?.countryCode,
            postal_code: shippingAddress?.postalCode,
        };
    }

    mapToLegacyBillingAddress(details: BraintreeTokenizationDetails): Partial<LegacyAddress> {
        const { billingAddress, email, firstName, lastName, phone, shippingAddress } = details;

        const address = billingAddress || shippingAddress;

        return {
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: phone,
            address_line_1: address?.line1,
            address_line_2: address?.line2,
            city: address?.city,
            state: address?.state,
            country_code: address?.countryCode,
            postal_code: address?.postalCode,
        };
    }

    removeElement(elementId?: string): void {
        const element = elementId && document.getElementById(elementId);

        if (element) {
            element.remove();
        }
    }

    async getSessionId(cartId?: string): Promise<string | undefined> {
        const { deviceData } = await this.getDataCollector({
            riskCorrelationId: cartId,
        });

        return deviceData;
    }

    async teardown(): Promise<void> {
        await this.teardownModule(this.dataCollectors.default);
        await this.teardownModule(this.dataCollectors.paypal);
        this.dataCollectors = {};

        await this.teardownModule(this.paypalCheckout);
        this.paypalCheckout = undefined;

        // await this.teardownModule(this._venmoCheckout);
        // this._venmoCheckout = undefined;

        // await this.teardownModule(this._visaCheckout);
        // this._visaCheckout = undefined;
    }

    async get3DS(): Promise<BraintreeThreeDSecure> {
        if (!this.threeDS) {
            this.threeDS = Promise.all([
                this.getClient(),
                this.braintreeScriptLoader.load3DS(),
            ]).then(([client, threeDSecure]) => threeDSecure.create({ client, version: 2 }));
        }

        return this.threeDS;
    }

    async getVenmoCheckout(
        venmoConfig?: BraintreeVenmoCreatorConfig,
    ): Promise<BraintreeVenmoCheckout> {
        if (!this.venmoCheckout) {
            const client = await this.getClient();
            const venmoCheckout = await this.braintreeScriptLoader.loadVenmoCheckout();

            const venmoCheckoutConfig = {
                client,
                allowDesktop: true,
                paymentMethodUsage: 'multi_use',
                ...(venmoConfig || {}),
            };

            this.venmoCheckout = await new Promise<BraintreeVenmoCheckout>((resolve, reject) => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                venmoCheckout.create(
                    venmoCheckoutConfig,
                    (error: BraintreeError, braintreeVenmoCheckout: BraintreeVenmoCheckout) => {
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (error) {
                            return reject(error);
                        }

                        if (!braintreeVenmoCheckout.isBrowserSupported()) {
                            return reject(new UnsupportedBrowserError());
                        }

                        resolve(braintreeVenmoCheckout);
                    },
                );
            });
        }

        return this.venmoCheckout;
    }

    /*
       Braintree Credit Card and Braintree Hosted Form
   */
    async verifyCard(
        payment: Payment,
        billingAddress: Address,
        amount: number,
    ): Promise<NonceInstrument> {
        const tokenizationPayload = await this.tokenizeCard(payment, billingAddress);

        return this.challenge3DSVerification(tokenizationPayload, amount);
    }

    async tokenizeCard(payment: Payment, billingAddress: Address): Promise<TokenizationPayload> {
        const { paymentData } = payment;

        if (!isCreditCardInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        const errors = this.getErrorsRequiredFields(paymentData);

        if (!isEmpty(errors)) {
            throw new PaymentInvalidFormError(errors);
        }

        const requestData = this.mapToCreditCard(paymentData, billingAddress);
        const client = await this.getClient();
        const { creditCards } = await client.request(requestData);

        return {
            nonce: creditCards[0].nonce,
            bin: creditCards[0].details.bin,
        };
    }

    async challenge3DSVerification(
        tokenizationPayload: TokenizationPayload,
        amount: number,
    ): Promise<BraintreeVerifyPayload> {
        const threeDSecure = await this.get3DS();

        return this.present3DSChallenge(threeDSecure, amount, tokenizationPayload);
    }

    private teardownModule(module?: BraintreeModule) {
        return module ? module.teardown() : Promise.resolve();
    }

    private getClientTokenOrThrow(): string {
        if (!this.clientToken) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this.clientToken;
    }

    private getErrorsRequiredFields(
        paymentData: CreditCardInstrument,
    ): PaymentInvalidFormErrorDetails {
        const { ccNumber, ccExpiry } = paymentData;
        const errors: PaymentInvalidFormErrorDetails = {};

        if (!ccNumber) {
            errors.ccNumber = [
                {
                    message: 'Credit card number is required',
                    type: 'required',
                },
            ];
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!ccExpiry) {
            errors.ccExpiry = [
                {
                    message: 'Expiration date is required',
                    type: 'required',
                },
            ];
        }

        return errors;
    }

    private mapToCreditCard(
        creditCard: CreditCardInstrument,
        billingAddress?: Address,
    ): BraintreeRequestData {
        return {
            data: {
                creditCard: {
                    cardholderName: creditCard.ccName,
                    number: creditCard.ccNumber,
                    cvv: creditCard.ccCvv,
                    expirationDate: `${creditCard.ccExpiry.month}/${creditCard.ccExpiry.year}`,
                    options: {
                        validate: false,
                    },
                    billingAddress: billingAddress && {
                        countryCodeAlpha2: billingAddress.countryCode,
                        locality: billingAddress.city,
                        countryName: billingAddress.country,
                        postalCode: billingAddress.postalCode,
                        streetAddress: billingAddress.address2
                            ? `${billingAddress.address1} ${billingAddress.address2}`
                            : billingAddress.address1,
                    },
                },
            },
            endpoint: 'payment_methods/credit_cards',
            method: 'post',
        };
    }

    private present3DSChallenge(
        threeDSecure: BraintreeThreeDSecure,
        amount: number,
        tokenizationPayload: TokenizationPayload,
    ): Promise<BraintreeVerifyPayload> {
        const { nonce, bin } = tokenizationPayload;

        if (!this.threeDSecureOptions || !nonce) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const {
            addFrame,
            removeFrame,
            challengeRequested = true,
            additionalInformation,
        } = this.threeDSecureOptions;
        const cancelVerifyCard = async () => {
            const response = await threeDSecure.cancelVerifyCard();
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            verification.cancel(new PaymentMethodCancelledError());

            return response;
        };

        const roundedAmount = amount.toFixed(2);

        const verification = new CancellablePromise(
            threeDSecure.verifyCard({
                addFrame: (error, iframe) => {
                    if (addFrame) {
                        addFrame(error, iframe, cancelVerifyCard);
                    }
                },
                amount: Number(roundedAmount),
                bin,
                challengeRequested,
                nonce,
                removeFrame,
                onLookupComplete: (_data, next) => {
                    next();
                },
                collectDeviceData: true,
                additionalInformation,
            }),
        );

        return verification.promise;
    }
}
