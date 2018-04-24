import { RequestOptions } from '../common/http-request';

import {
    AmazonPayPaymentInitializeOptions,
    BraintreePaymentInitializeOptions,
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
    klarna?: KlarnaPaymentInitializeOptions;
    square?: SquarePaymentInitializeOptions;
}
