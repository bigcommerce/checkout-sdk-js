import { CreditCardPaymentInitializeOptions } from '@bigcommerce/checkout-sdk/credit-card-integration';

import { RequestOptions } from '../common/http-request';

import { BlueSnapV2PaymentInitializeOptions } from './strategies/bluesnapv2';
import {
    BraintreePaymentInitializeOptions,
    BraintreeVisaCheckoutPaymentInitializeOptions,
} from './strategies/braintree';
import { DigitalRiverPaymentInitializeOptions } from './strategies/digitalriver';
import { MasterpassPaymentInitializeOptions } from './strategies/masterpass';
import { MonerisPaymentInitializeOptions } from './strategies/moneris';
import { OpyPaymentInitializeOptions } from './strategies/opy';
import { PaypalExpressPaymentInitializeOptions } from './strategies/paypal';
import { SquarePaymentInitializeOptions } from './strategies/square';

export { PaymentInitializeOptions } from '../generated/payment-initialize-options';

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
export interface BasePaymentInitializeOptions extends PaymentRequestOptions {
    /**
     * @alpha
     * Please note that this option is currently in an early stage of
     * development. Therefore the API is unstable and not ready for public
     * consumption.
     */
    creditCard?: CreditCardPaymentInitializeOptions;

    /**
     * The options that are required to initialize the BlueSnapV2 payment method.
     * They can be omitted unless you need to support BlueSnapV2.
     */
    bluesnapv2?: BlueSnapV2PaymentInitializeOptions;

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
     * The options that are required to initialize the Square payment method.
     * They can be omitted unless you need to support Square.
     */
    square?: SquarePaymentInitializeOptions;
}
