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
    // Set by the load whose script created the SDK; a repeat load of a cached URL doesn't re-run the script.
    private static clientMetadataIds = new WeakMap<PayPalSDK, string | undefined>();

    // PAYPAL-7373: the SDK charges in the currency it was loaded with, and a shopper can switch
    // currency at checkout. The script loader caches scripts by URL, so a currency loaded before
    // is not run again: keep each currency's SDK to switch back to it.
    private static sdkCurrencies = new WeakMap<PayPalSDK, string>();
    private static sdkByCurrency = new Map<string, PayPalSDK>();

    private window: BigCommercePaymentsHostWindow;

    constructor(private scriptLoader: ScriptLoader) {
        this.window = window;
    }

    async getPayPalSDK(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage?: boolean,
        forceLoad?: boolean,
        clientMetadataId?: string,
    ): Promise<PayPalSDK> {
        const paypalSdkScriptConfig = this.getPayPalSdkScriptConfigOrThrow(
            paymentMethod,
            currencyCode,
            initializesOnCheckoutPage,
            clientMetadataId,
        );

        return this.loadPayPalSDK(paypalSdkScriptConfig, forceLoad);
    }

    getClientMetadataId(paypalSdk: PayPalSDK): string | undefined {
        return BigCommercePaymentsScriptLoader.clientMetadataIds.get(paypalSdk);
    }

    private async loadPayPalSDK(
        paypalSdkScriptConfig: BigCommercePaymentsScriptParams,
        forceLoad = false,
    ): Promise<PayPalSDK> {
        const currencyCode = paypalSdkScriptConfig.options.currency;
        const currentSdk = this.window.bigCommercePaymentsPayPalSDK;
        const currentSdkCurrency = currentSdk
            ? BigCommercePaymentsScriptLoader.sdkCurrencies.get(currentSdk)
            : undefined;
        const isOtherCurrency =
            currentSdkCurrency !== undefined && currentSdkCurrency !== currencyCode;
        const sdkLoadedForCurrency = currencyCode
            ? BigCommercePaymentsScriptLoader.sdkByCurrency.get(currencyCode)
            : undefined;

        if (forceLoad) {
            // A forced load means a new client configuration: the SDKs loaded before are stale.
            BigCommercePaymentsScriptLoader.sdkByCurrency.clear();
        }

        if (isOtherCurrency && sdkLoadedForCurrency && !forceLoad) {
            this.window.bigCommercePaymentsPayPalSDK = sdkLoadedForCurrency;

            return sdkLoadedForCurrency;
        }

        if (!this.window.bigCommercePaymentsPayPalSDK || forceLoad || isOtherCurrency) {
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

            if (currencyCode && this.window.bigCommercePaymentsPayPalSDK) {
                BigCommercePaymentsScriptLoader.sdkCurrencies.set(
                    this.window.bigCommercePaymentsPayPalSDK,
                    currencyCode,
                );
                BigCommercePaymentsScriptLoader.sdkByCurrency.set(
                    currencyCode,
                    this.window.bigCommercePaymentsPayPalSDK,
                );
            }

            const loadedSdk = this.window.bigCommercePaymentsPayPalSDK;

            if (loadedSdk && !BigCommercePaymentsScriptLoader.clientMetadataIds.has(loadedSdk)) {
                BigCommercePaymentsScriptLoader.clientMetadataIds.set(
                    loadedSdk,
                    attributes['data-client-metadata-id'],
                );
            }
        }

        if (!this.window.bigCommercePaymentsPayPalSDK) {
            throw new PaymentMethodClientUnavailableError();
        }

        return this.window.bigCommercePaymentsPayPalSDK;
    }

    private getPayPalSdkScriptConfigOrThrow(
        paymentMethod: PaymentMethod<BigCommercePaymentsInitializationData>,
        currencyCode: string,
        initializesOnCheckoutPage = true,
        clientMetadataId?: string,
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
            // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
            availableAlternativePaymentMethods = [],
            // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
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
                'data-client-metadata-id': clientMetadataId,
                'data-namespace': 'bigCommercePaymentsPayPalSDK',
            },
        };
    }

    private filterFundingOptions(fundingOptions: FundingType[] | undefined): FundingType[] {
        const fundingTypesToBeFiltered = ['klarna', 'afterpay'];

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
