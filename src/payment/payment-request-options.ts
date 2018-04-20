import { RequestOptions } from '../common/http-request';

import PaymentMethod from './payment-method';
import {
    AmazonPayPaymentInitializeOptions,
    BraintreeCreditCardPaymentInitializeOptions,
    KlarnaPaymentInitializeOptions,
    SquarePaymentInitializeOptions,
} from './strategies';

export interface PaymentRequestOptions extends RequestOptions {
    paymentMethod?: PaymentMethod;
}

export interface PaymentInitializeOptions extends PaymentRequestOptions {
    amazon?: AmazonPayPaymentInitializeOptions;
    braintree?: BraintreeCreditCardPaymentInitializeOptions;
    klarna?: KlarnaPaymentInitializeOptions;
    square?: SquarePaymentInitializeOptions;
}
