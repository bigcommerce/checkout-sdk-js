import { ScriptLoader } from '@bigcommerce/script-loader';

import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
    PaymentMethodClientUnavailableError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    BigCommercePaymentsHostWindow,
    BigCommercePaymentsInitializationData,
    BigCommercePaymentsScriptParams,
    ComponentsScriptType,
    FundingType,
    PayPalSDK,
} from './bigcommerce-payments-types';

export default class BigCommercePaymentsScriptLoader {
    private window: BigCommercePaymentsHostWindow;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async getPayPalSDK(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
    ): Promise<PayPalSDK> {
        const paypalSdkScriptConfig = this.getPayPalSdkScriptConfigOrThrow(
            paymentMethod,
            currencyCode,
            initializesOnCheckoutPage,
        );

        return this.loadPayPalSDK(paypalSdkScriptConfig, forceLoad);
    }

    private async loadPayPalSDK(
        paypalSdkScriptConfig: BigCommercePaymentsScriptParams,
        forceLoad = false,
    ): Promise<PayPalSDK> {
        if (!this.window.paypal || forceLoad) {
            const options = this.transformConfig<BigCommercePaymentsScriptParams['options']>(
                paypalSdkScriptConfig.options,
            );
            const attributes = this.transformConfig<BigCommercePaymentsScriptParams['attributes']>(
                paypalSdkScriptConfig.attributes,
            );

            const paypalSdkUrl = 'https://www.paypal.com/sdk/js';
            const scriptQuery = new URLSearchParams(options).toString();
            const scriptSrc = `${paypalSdkUrl}?${scriptQuery}`;

            await this.scriptLoader.loadScript(scriptSrc, { async: true, attributes });
        }

        if (!this.window.paypal) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.paypal;
    }

    private getPayPalSdkScriptConfigOrThrow(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage = true,
    ): BigCommercePaymentsScriptParams {
        const { id, clientToken, initializationData } = paymentMethod;

        if (!initializationData?.clientId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            intent,
            clientId,
            merchantId,
            buyerCountry,
            attributionId,
            isVenmoEnabled,
            isHostedCheckoutEnabled,
            isPayPalCreditAvailable,
            isDeveloperModeApplicable,
            availableAlternativePaymentMethods = [],
            enabledAlternativePaymentMethods = [],
            isGooglePayEnabled,
        } = initializationData;

        const commit = isHostedCheckoutEnabled || initializesOnCheckoutPage;

        const shouldEnableCard = id === 'bigcommerce_payments_creditcards';
        const enableCardFunding = shouldEnableCard ? ['card'] : [];
        const disableCardFunding = !shouldEnableCard ? ['card'] : [];

        const enableCreditFunding = isPayPalCreditAvailable ? ['credit', 'paylater'] : [];
        const disableCreditFunding = !isPayPalCreditAvailable ? ['credit', 'paylater'] : [];

        const enableVenmoFunding = isVenmoEnabled ? ['venmo'] : [];
        const disableVenmoFunding = !isVenmoEnabled ? ['venmo'] : [];
        const disableAPMsFunding = availableAlternativePaymentMethods.filter(
            (apm: string) => !enabledAlternativePaymentMethods.includes(apm),
        );
        const googlePayComponent: ComponentsScriptType = isGooglePayEnabled ? ['googlepay'] : [];
        const cardFieldsComponent: ComponentsScriptType = initializesOnCheckoutPage
            ? ['card-fields']
            : [];
        const disableFunding: FundingType[] = this.filterFundingOptions([
            ...disableCardFunding,
            ...disableCreditFunding,
            ...disableVenmoFunding,
            ...disableAPMsFunding,
        ]);
        const enableFunding: FundingType[] = this.filterFundingOptions([
            ...enableCardFunding,
            ...enableCreditFunding,
            ...enableVenmoFunding,
            ...enabledAlternativePaymentMethods,
        ]);

        return {
            options: {
                'client-id': clientId,
                'merchant-id': merchantId,
                'enable-funding': enableFunding.length > 0 ? enableFunding : undefined,
                'disable-funding': disableFunding.length > 0 ? disableFunding : undefined,
                commit,
                components: [
                    'buttons',
                    'hosted-fields',
                    'payment-fields',
                    'legal',
                    ...googlePayComponent,
                    ...cardFieldsComponent,
                ],
                currency: currencyCode,
                intent,
                ...(isDeveloperModeApplicable && { 'buyer-country': buyerCountry }),
            },
            attributes: {
                'data-partner-attribution-id': attributionId,
                'data-client-token': clientToken,
            },
        };
    }

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
