import AfterpaySdk from './afterpay-sdk';

export default interface AfterpayWindow extends Window {
    AfterPay: AfterpaySdk;
}
