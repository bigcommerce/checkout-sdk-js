import {
    BraintreeConnectCardComponent,
    BraintreeFastlanePaymentComponent,
} from '@bigcommerce/checkout-sdk/braintree-utils';

export default function isBraintreeFastlaneCardComponent(
    cardComponent: BraintreeFastlanePaymentComponent | BraintreeConnectCardComponent,
): cardComponent is BraintreeFastlanePaymentComponent {
    return (
        cardComponent.hasOwnProperty('getPaymentToken') && cardComponent.hasOwnProperty('render')
    );
}
