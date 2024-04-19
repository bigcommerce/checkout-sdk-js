import {
    BraintreeConnectCardComponent,
    BraintreeFastlanePaymentComponent,
} from '@bigcommerce/checkout-sdk/braintree-utils';

export default function isBraintreeConnectCardComponent(
    cardComponent: BraintreeFastlanePaymentComponent | BraintreeConnectCardComponent,
): cardComponent is BraintreeConnectCardComponent {
    return cardComponent.hasOwnProperty('tokenize') && cardComponent.hasOwnProperty('render');
}
