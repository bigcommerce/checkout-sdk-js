import {
    BraintreeConnectCardComponent,
    BraintreeFastlaneCardComponent,
} from '@bigcommerce/checkout-sdk/braintree-utils';

export default function isBraintreeConnectCardComponent(
    cardComponent: BraintreeFastlaneCardComponent | BraintreeConnectCardComponent,
): cardComponent is BraintreeConnectCardComponent {
    return cardComponent.hasOwnProperty('tokenize') && cardComponent.hasOwnProperty('render');
}
