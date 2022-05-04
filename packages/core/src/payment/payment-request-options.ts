import { RequestOptions } from '../common/http-request';

import { AdyenV2PaymentInitializeOptions } from './strategies/adyenv2';
import { AdyenV3PaymentInitializeOptions } from './strategies/adyenv3';
import { AmazonPayPaymentInitializeOptions } from './strategies/amazon-pay';
import { AmazonPayV2PaymentInitializeOptions } from './strategies/amazon-pay-v2';
import { ApplePayPaymentInitializeOptions } from './strategies/apple-pay';
import { BlueSnapV2PaymentInitializeOptions } from './strategies/bluesnapv2';
import { BoltPaymentInitializeOptions } from './strategies/bolt';
import { BraintreePaymentInitializeOptions, BraintreeVisaCheckoutPaymentInitializeOptions } from './strategies/braintree';
import { ChasePayInitializeOptions } from './strategies/chasepay';
import { CreditCardPaymentInitializeOptions } from './strategies/credit-card';
import { DigitalRiverPaymentInitializeOptions } from './strategies/digitalriver';
import { GooglePayPaymentInitializeOptions } from './strategies/googlepay';
import { KlarnaPaymentInitializeOptions } from './strategies/klarna';
import { KlarnaV2PaymentInitializeOptions } from './strategies/klarnav2';
import { MasterpassPaymentInitializeOptions } from './strategies/masterpass';
import { MolliePaymentInitializeOptions } from './strategies/mollie';
import { MonerisPaymentInitializeOptions } from './strategies/moneris';
import { OpyPaymentInitializeOptions } from './strategies/opy';
import { PaypalExpressPaymentInitializeOptions } from './strategies/paypal';
import { PaypalCommerceInitializeOptions } from './strategies/paypal-commerce';
import { SquarePaymentInitializeOptions } from './strategies/square';
import { StripeUPEPaymentInitializeOptions } from './strategies/stripe-upe';
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
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    creditCard?: CreditCardPaymentInitializeOptions;

    /**
     * The options that are required to initialize the AdyenV2 payment
     * method. They can be omitted unless you need to support AdyenV2.
     */
    adyenv2?: AdyenV2PaymentInitializeOptions;

    /**
     * The options that are required to initialize the AdyenV3 payment
     * method. They can be omitted unless you need to support AdyenV3.
     */
     adyenv3?: AdyenV3PaymentInitializeOptions;

    /**
     * The options that are required to initialize the Amazon Pay payment
     * method. They can be omitted unless you need to support AmazonPay.
     */
    amazon?: AmazonPayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support AmazonPay.
     */
    applepay?: ApplePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the AmazonPayV2 payment
     * method. They can be omitted unless you need to support AmazonPayV2.
     */
    amazonpay?: AmazonPayV2PaymentInitializeOptions;

    /**
     * The options that are required to initialize the BlueSnapV2 payment method.
     * They can be omitted unless you need to support BlueSnapV2.
     */
    bluesnapv2?: BlueSnapV2PaymentInitializeOptions;

    /**
     * The options that allow Bolt to load the client script and handle the checkout.
     * They can be omitted if Bolt's full checkout take over is intended.
     */
    bolt?: BoltPaymentInitializeOptions;

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
     * The options that are required to initialize the Digital River payment method.
     * They can be omitted unless you need to support Digital River.
     */
    digitalriver?: DigitalRiverPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Klarna payment method.
     * They can be omitted unless you need to support Klarna.
     */
    klarna?: KlarnaPaymentInitializeOptions;

    /**
     * The options that are required to initialize the KlarnaV2 payment method.
     * They can be omitted unless you need to support KlarnaV2.
     */
    klarnav2?: KlarnaV2PaymentInitializeOptions;

    /**
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Moneris payment method.
     * They can be omitted unless you need to support Moneris.
     */
    moneris?: MonerisPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Opy payment
     * method. They can be omitted unless you need to support Opy.
     */
    opy?: OpyPaymentInitializeOptions;

    /**
     * The options that are required to initialize the PayPal Express payment method.
     * They can be omitted unless you need to support PayPal Express.
     */
    paypalexpress?: PaypalExpressPaymentInitializeOptions;

    /**
     * The options that are required to initialize the PayPal Commerce payment method.
     * They can be omitted unless you need to support PayPal Commerce.
     */
    paypalcommerce?: PaypalCommerceInitializeOptions;

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
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv2?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
     googlepayadyenv3?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Authorize.Net
     * payment method. They can be omitted unless you need to support GooglePay.
     */
    googlepayauthorizenet?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Braintree payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybraintree?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Checkout.com payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycheckoutcom?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay CybersourceV2 payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycybersourcev2?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayorbital?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Stripe payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripe?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay Stripe payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripeupe?: GooglePayPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Stripe payment method.
     * They can be omitted unless you need to support StripeV3.
     */
    stripev3?: StripeV3PaymentInitializeOptions;

    /**
     * The options that are required to initialize the StripeUPE payment method.
     * They can be omitted unless you need to support StripeUPE.
     */
    stripeupe?: StripeUPEPaymentInitializeOptions;

    /**
     * The options that are required to initialize the Mollie payment method.
     * They can be omitted unless you need to support Mollie.
     */
    mollie?: MolliePaymentInitializeOptions;
}
