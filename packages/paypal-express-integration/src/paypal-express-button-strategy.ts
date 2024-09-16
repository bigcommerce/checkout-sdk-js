import { FormPoster } from '@bigcommerce/form-poster';

import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    INTERNAL_USE_ONLY,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    PaymentIntegrationService,
    SDK_VERSION_HEADERS,
    StandardError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithPaypalExpressButtonInitializeOptions } from './paypal-express-button-initialize-options';
import PaypalScriptLoader from './paypal-express-script-loader';
import {
    PaypalActions,
    PaypalAuthorizeData,
    PaypalButtonStyleShapeOption,
    PaypalButtonStyleSizeOption,
    PaypalClientToken,
    PaypalSDK,
    PaypalStyleOptions,
} from './paypal-express-types';

export default class PaypalButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalExpressScriptLoader: PaypalScriptLoader,
        private formPoster: FormPoster,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPaypalExpressButtonInitializeOptions,
    ): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(options.methodId);

        if (!options.paypal) {
            throw new InvalidArgumentError();
        }

        if (!paymentMethod.config.merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paypalSDK = await this.paypalExpressScriptLoader.loadPaypalSDK(
            paymentMethod.config.merchantId,
        );

        this.renderButton(options, paypalSDK);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        options: CheckoutButtonInitializeOptions & WithPaypalExpressButtonInitializeOptions,
        paypalSDK: PaypalSDK,
    ) {
        const { containerId, methodId, paypal } = options;
        const { allowCredit, clientId, onPaymentError, shouldProcessPayment, style } = paypal;

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(options.methodId);

        if (!paymentMethod.config.merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const merchantId = paymentMethod.config.merchantId;
        const env = paymentMethod.config.testMode ? 'sandbox' : 'production';
        const clientToken: PaypalClientToken = { [env]: clientId };
        const fundingCreditOption = paypalSDK.FUNDING.CREDIT || 'credit';
        const allowedSources = allowCredit ? [fundingCreditOption] : [];
        const disallowedSources = !allowCredit ? [fundingCreditOption] : [];

        return paypalSDK.Button.render(
            {
                env,
                client: clientToken,
                commit: shouldProcessPayment,
                funding: {
                    allowed: allowedSources,
                    disallowed: disallowedSources,
                },
                style: this.getStyle(style),
                payment: (_, actions) => this.setupPayment(merchantId, actions, onPaymentError),
                onAuthorize: (data, actions) =>
                    this.tokenizePayment(data, methodId, actions, shouldProcessPayment),
            },
            containerId,
        );
    }

    private getStyle(style?: Omit<PaypalStyleOptions, 'height'>): PaypalStyleOptions {
        const { color, fundingicons, label, layout, shape, size, tagline } = style || {};

        return {
            color,
            fundingicons,
            label,
            layout,
            shape: shape || PaypalButtonStyleShapeOption.RECT,
            size: size === 'small' ? PaypalButtonStyleSizeOption.RESPONSIVE : size,
            tagline,
        };
    }

    private async setupPayment(
        merchantId: string,
        actions?: PaypalActions,
        onError?: (error: StandardError) => void,
    ): Promise<string> {
        if (!actions) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        try {
            const state = await this.paymentIntegrationService.loadDefaultCheckout();
            const { id: cartId } = state.getCartOrThrow();
            const host = state.getHost() || '';

            const paymentRequest = await actions.request.post(
                `${host}/api/storefront/payment/paypalexpress`,
                { merchantId, cartId },
                {
                    headers: {
                        'X-API-INTERNAL': INTERNAL_USE_ONLY,
                        ...SDK_VERSION_HEADERS,
                    },
                },
            );

            return paymentRequest.id;
        } catch (error) {
            if (onError && error instanceof StandardError) {
                onError(error);
            }

            throw error;
        }
    }

    private async tokenizePayment(
        data: PaypalAuthorizeData,
        methodId: string,
        actions?: PaypalActions,
        shouldProcessPayment?: boolean,
    ): Promise<void> {
        if (!actions) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        if (!data.paymentID || !data.payerID) {
            throw new MissingDataError(MissingDataErrorType.MissingPayment);
        }

        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId);

        const getPaymentData = await actions.payment.get(data.paymentID);

        return this.formPoster.postForm('/checkout.php', {
            payment_type: 'paypal',
            provider: paymentMethod.id,
            action: shouldProcessPayment ? 'process_payment' : 'set_external_checkout',
            paymentId: data.paymentID,
            payerId: data.payerID,
            payerInfo: JSON.stringify(getPaymentData.payer.payer_info),
        });
    }
}
