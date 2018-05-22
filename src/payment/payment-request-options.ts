import { RequestOptions } from '../common/http-request';

import {
    AmazonPayPaymentInitializeOptions,
    BraintreePaymentInitializeOptions,
    BraintreeVisaCheckoutPaymentInitializeOptions,
    KlarnaPaymentInitializeOptions,
    SquarePaymentInitializeOptions,
} from './strategies';

export interface PaymentRequestOptions extends RequestOptions {
    methodId: string;
    gatewayId?: string;
}

export interface PaymentInitializeOptions extends PaymentRequestOptions {
    amazon?: AmazonPayPaymentInitializeOptions;
    braintree?: BraintreePaymentInitializeOptions;
    braintreevisacheckout?: BraintreeVisaCheckoutPaymentInitializeOptions;
    klarna?: KlarnaPaymentInitializeOptions;
    square?: SquarePaymentInitializeOptions;
}
