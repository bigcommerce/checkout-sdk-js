import { RequestOptions } from '../common/http-request';

import {
    AmazonPayPaymentInitializeOptions,
    BraintreeCreditCardPaymentInitializeOptions,
    KlarnaPaymentInitializeOptions,
    SquarePaymentInitializeOptions,
} from './strategies';

export interface PaymentRequestOptions extends RequestOptions {
    methodId: string;
    gatewayId?: string;
}

export interface PaymentInitializeOptions extends PaymentRequestOptions {
    amazon?: AmazonPayPaymentInitializeOptions;
    braintree?: BraintreeCreditCardPaymentInitializeOptions;
    klarna?: KlarnaPaymentInitializeOptions;
    square?: SquarePaymentInitializeOptions;
}
