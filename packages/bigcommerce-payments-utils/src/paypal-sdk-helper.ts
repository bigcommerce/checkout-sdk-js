import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BigCommercePaymentsInitializationData,
    FundingType,
    PayPalFastlaneSdk,
    PayPalGooglePaySdk,
    PayPalHostWindow,
    PayPalMessagesSdk,
    PayPalSdkConfig,
} from './bigcommerce-payments-types';

export default class PayPalSdkHelper {
    private window: PayPalHostWindow;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async getPayPalFastlaneSdk(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        sessionId: string,
    ): Promise<PayPalFastlaneSdk> {
        if (!this.window.paypalFastlaneSdk) {
            const config = this.getPayPalFastlaneSdkConfiguration(
                paymentMethod,
                currencyCode,
                sessionId,
            );

            await this.loadPayPalSdk(config);

            if (!this.window.paypalFastlaneSdk) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        return this.window.paypalFastlaneSdk;
    }

    async getPayPalGooglePaySdk(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<PayPalGooglePaySdk> {
        if (!this.window.paypalGooglePay || forceLoad) {
            const paypalSdkScriptConfig = this.getPayPalGooglePaySdkScriptConfigOrThrow(
                paymentMethod,
                currencyCode,
                initializesOnCheckoutPage,
            );

            await this.loadPayPalSdk(paypalSdkScriptConfig);
        }

        if (!this.window.paypalGooglePay) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypalGooglePay;
    }

    async getPayPalApmsSdk(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
    ) {
        if (!this.window.paypalApms) {
            const config = this.getPayPalApmSdkConfiguration(paymentMethod, currencyCode);

            await this.loadPayPalSdk(config);

            if (!this.window.paypalApms) {
                throw new PaymentMethodClientUnavailableError();
            }
        }

        return this.window.paypalApms;
    }

    async getPayPalMessages(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
    ): Promise<PayPalMessagesSdk> {
        if (!this.window.paypalMessages) {
            const paypalSdkMessagesConfig = this.getPayPalSdkMessagesConfiguration(
                paymentMethod,
                currencyCode,
            );

            await this.loadPayPalSdk(paypalSdkMessagesConfig);
        }

        if (!this.window.paypalMessages) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypalMessages;
    }

    /**
     *
     *  loadPayPalSdk is a paypal sdk script loader
     *  which loads paypal sdk based on provided configuration
     *
     */
    private async loadPayPalSdk({ options, attributes }: PayPalSdkConfig): Promise<void> {
        const scriptOptions = this.transformConfig<PayPalSdkConfig['options']>(options);
        const scriptAttributes = this.transformConfig<PayPalSdkConfig['attributes']>(attributes);

        const paypalSdkUrl = 'https://www.paypal.com/sdk/js';
        const scriptQuery = new URLSearchParams(scriptOptions).toString();
        const scriptSrc = `${paypalSdkUrl}?${scriptQuery}`;

        await this.scriptLoader.loadScript(scriptSrc, {
            async: true,
            attributes: scriptAttributes,
        });
    }

    /**
     *
     * Configurations section
     *
     */
    private getPayPalFastlaneSdkConfiguration(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        sessionId: string,
    ): PayPalSdkConfig {
        const { clientToken, initializationData } = paymentMethod;

        if (!initializationData || !initializationData.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { intent, clientId, merchantId, attributionId } = initializationData;

        return {
            options: {
                'client-id': clientId,
                'merchant-id': merchantId,
                commit: true,
                components: ['fastlane', 'three-domain-secure'],
                currency: currencyCode,
                intent,
            },
            attributes: {
                'data-client-metadata-id': sessionId.replace(/-/g, ''),
                'data-namespace': 'paypalFastlaneSdk',
                'data-partner-attribution-id': attributionId,
                'data-sdk-client-token': clientToken,
            },
        };
    }

    private getPayPalGooglePaySdkScriptConfigOrThrow(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage = true,
    ): PayPalSdkConfig {
        const { clientToken, initializationData } = paymentMethod;

        if (!initializationData || !initializationData.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            intent,
            clientId,
            merchantId,
            buyerCountry,
            attributionId,
            isHostedCheckoutEnabled,
            isDeveloperModeApplicable,
        } = initializationData;

        const commit = isHostedCheckoutEnabled || initializesOnCheckoutPage;

        return {
            options: {
                'client-id': clientId,
                'merchant-id': merchantId,
                commit,
                components: ['googlepay'],
                currency: currencyCode,
                intent,
                ...(isDeveloperModeApplicable && { 'buyer-country': buyerCountry }),
            },
            attributes: {
                'data-partner-attribution-id': attributionId,
                'data-client-token': clientToken,
                'data-namespace': 'paypalGooglePay',
            },
        };
    }

    private getPayPalApmSdkConfiguration(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
    ): PayPalSdkConfig {
        const { initializationData } = paymentMethod;

        if (!initializationData || !initializationData.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            intent,
            clientId,
            merchantId,
            buyerCountry,
            attributionId,
            isDeveloperModeApplicable,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
        } = initializationData;

        const enableAPMsFunding = this.filterFundingOptions(enabledAlternativePaymentMethods);
        const disableAPMsFunding = this.filterFundingOptions(
            availableAlternativePaymentMethods.filter(
                (apm: string) => !enabledAlternativePaymentMethods.includes(apm),
            ),
        );

        return {
            options: {
                'client-id': clientId,
                'merchant-id': merchantId,
                'enable-funding': enableAPMsFunding.length > 0 ? enableAPMsFunding : undefined,
                'disable-funding': disableAPMsFunding.length > 0 ? disableAPMsFunding : undefined,
                commit: true,
                components: ['buttons', 'payment-fields'],
                currency: currencyCode,
                intent,
                ...(isDeveloperModeApplicable && { 'buyer-country': buyerCountry }),
            },
            attributes: {
                'data-partner-attribution-id': attributionId,
                'data-namespace': 'paypalApms',
            },
        };
    }

    private getPayPalSdkMessagesConfiguration(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
    ): PayPalSdkConfig {
        const { initializationData } = paymentMethod;

        if (!initializationData || !initializationData.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const { clientId, merchantId, attributionId, isDeveloperModeApplicable, buyerCountry } =
            initializationData;

        return {
            options: {
                'client-id': clientId,
                'merchant-id': merchantId,
                components: ['messages'],
                currency: currencyCode,
                ...(isDeveloperModeApplicable && { 'buyer-country': buyerCountry }),
            },
            attributes: {
                'data-namespace': 'paypalMessages',
                'data-partner-attribution-id': attributionId,
            },
        };
    }

    /**
     *
     * Utils methods
     *
     */
    private filterFundingOptions(fundingOptions: FundingType[] | undefined): FundingType[] {
        const fundingTypesToBeFiltered = ['klarna'];

        if (!fundingOptions) {
            return [];
        }

        return fundingOptions.filter(
            (fundingOption: FundingType) => !fundingTypesToBeFiltered.includes(fundingOption),
        );
    }

    private transformConfig<T extends Record<string, unknown>>(config: T): Record<string, string> {
        let transformedConfig = {};

        const keys = Object.keys(config) as Array<keyof T>;

        keys.forEach((key) => {
            const value = config[key];

            if (
                value === undefined ||
                value === null ||
                value === '' ||
                (Array.isArray(value) && value.length === 0)
            ) {
                return;
            }

            transformedConfig = {
                ...transformedConfig,
                [key]: Array.isArray(value) ? value.join(',') : value,
            };
        });

        return transformedConfig;
    }
}
