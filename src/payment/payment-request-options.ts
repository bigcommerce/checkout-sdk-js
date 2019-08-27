import { RequestOptions } from '../common/http-request';

import { AdyenV2PaymentInitializeOptions } from './strategies/adyenv2';
import { AmazonPayPaymentInitializeOptions } from './strategies/amazon-pay';
import { BraintreePaymentInitializeOptions, BraintreeVisaCheckoutPaymentInitializeOptions } from './strategies/braintree';
import { ChasePayInitializeOptions } from './strategies/chasepay';
import { GooglePayPaymentInitializeOptions } from './strategies/googlepay';
import { KlarnaPaymentInitializeOptions } from './strategies/klarna';
import { MasterpassPaymentInitializeOptions } from './strategies/masterpass';
import { PaypalExpressPaymentInitializeOptions } from './strategies/paypal';
import { SquarePaymentInitializeOptions } from './strategies/square';
import { StripeV3PaymentInitializeOptions } from './strategies/stripev3';

/**
 * The set of options for configuring any requests related to the payment step of
 * the current checkout flow.
 */
export interface PaymentRequestOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;

    /**
     * The identifier of the payment provider providing the payment method. This
     * option is only required if the provider offers multiple payment options.
     * i.e.: Adyen and Klarna.
     */
    gatewayId?: string;
}

/**
 * A set of options that are required to initialize the payment step of the
 * current checkout flow.
 */
export interface PaymentInitializeOptions extends PaymentRequestOptions {
    /**
     * The options that are required to initialize the AdyenV2 payment
     * method. They can be omitted unless you need to support AdyenV2.
     */
    adyenv2?: AdyenV2PaymentInitializeOptions;

    /**
     * The options that are required to initialize the Amazon Pay payment
     * method. They can be omitted unless you need to support AmazonPay.
     */
    amazon?: AmazonPayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Braintree payment method.
     * They can be omitted unless you need to support Braintree.
     */
    braintree?: BraintreePaymentInitializeOptions;

    /**
     * The options that are required to initialize the Visa Checkout payment
     * method provided by Braintree. They can be omitted unless you need to
     * support Visa Checkout.
     */
    braintreevisacheckout?: BraintreeVisaCheckoutPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Klarna payment method.
     * They can be omitted unless you need to support Klarna.
     */
    klarna?: KlarnaPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassPaymentInitializeOptions;

    /**
     * The options that are required to initialize the PayPal Express payment method.
     * They can be omitted unless you need to support PayPal Express.
     */
    paypalexpress?: PaypalExpressPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Square payment method.
     * They can be omitted unless you need to support Square.
     */
    square?: SquarePaymentInitializeOptions;

    /**
     * The options that are required to initialize the Chasepay payment method.
     * They can be omitted unless you need to support Chasepay.
     */
    chasepay?: ChasePayInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Braintree payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybraintree?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Stripe payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripe?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Stripe payment method.
     * They can be omitted unless you need to support StripeV3.
     */
    stripev3?: StripeV3PaymentInitializeOptions;
}
