import {
    BraintreeConnectCardComponent,
    BraintreeFastlaneCardComponent,
} from '@bigcommerce/checkout-sdk/braintree-utils';

export default function isBraintreeFastlaneCardComponent(
    cardComponent: BraintreeFastlaneCardComponent | BraintreeConnectCardComponent,
): cardComponent is BraintreeFastlaneCardComponent {
    return (
        cardComponent.hasOwnProperty('getPaymentToken') && cardComponent.hasOwnProperty('render')
    );
}
