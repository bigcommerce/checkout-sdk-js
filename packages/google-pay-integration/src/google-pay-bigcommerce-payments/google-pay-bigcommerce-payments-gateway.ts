import {
    BigCommercePaymentsInitializationData,
    PayPalSdkHelper,
} from '@bigcommerce/checkout-sdk/bigcommerce-payments-utils';
import {
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import GooglePayGateway from '../gateways/google-pay-gateway';
import assertsIsGooglePayPayPalCommercePaymentMethod from '../guards/is-google-pay-paypal-commerce-payment-method';
import {
    GooglePayCardDataResponse,
    GooglePayConfig,
    GooglePayPayPalCommerceGatewayParameters,
    GooglePayPayPalCommerceInitializationData,
    GooglePaySetExternalCheckoutData,
} from '../types';

export default class GooglePayBigCommercePaymentsGateway extends GooglePayGateway {
    private googlepayConfig?: GooglePayConfig;
    private service: PaymentIntegrationService;

    constructor(service: PaymentIntegrationService, private payPalSdkHelper: PayPalSdkHelper) {
        super('googlepay_bigcommerce_payments', service);

        this.service = service;
    }

    async initialize(
        getPaymentMethod: () => PaymentMethod<GooglePayPayPalCommerceInitializationData>,
        isBuyNowFlow?: boolean,
        currencyCode?: string,
    ): Promise<void> {
        const currency = this.service.getState().getStoreConfig()?.currency.code ?? currencyCode;

        if (!currency) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        await super.initialize(getPaymentMethod, isBuyNowFlow, currency);

        const paymentMethod = super.getPaymentMethod();

        if (!paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        assertsIsGooglePayPayPalCommercePaymentMethod(paymentMethod);

        const googlePaySdk = await this.payPalSdkHelper.getPayPalGooglePaySdk(
            paymentMethod as PaymentMethod<BigCommercePaymentsInitializationData>,
            currency,
        );

        this.googlepayConfig = await googlePaySdk.Googlepay().config();

        const { allowedPaymentMethods } = this.googlepayConfig;

        this.setGatewayIdentifier(
            allowedPaymentMethods[0]?.tokenizationSpecification?.parameters?.gateway,
        );
    }

    getPaymentGatewayParameters(): GooglePayPayPalCommerceGatewayParameters {
        if (this.googlepayConfig) {
            const { allowedPaymentMethods } = this.googlepayConfig;
            const { gatewayMerchantId } =
                allowedPaymentMethods[0].tokenizationSpecification.parameters;

            return {
                gateway: this.getGatewayIdentifier(),
                gatewayMerchantId,
            };
        }

        return {
            gateway: this.getGatewayIdentifier(),
        };
    }

    async mapToExternalCheckoutData(
        response: GooglePayCardDataResponse,
    ): Promise<GooglePaySetExternalCheckoutData> {
        const data = await super.mapToExternalCheckoutData(response);

        data.nonce = btoa(data.nonce);

        return data;
    }
}
