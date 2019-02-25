import { AffirmRemoteCheckout, AfterpayRemoteCheckout, AmazonPayRemoteCheckout } from './methods';

export default interface RemoteCheckoutState {
    data: RemoteCheckoutStateData;
}

export type RemoteCheckoutStateData =
{ affirm?: AffirmRemoteCheckout } &
    { amazon?: AmazonPayRemoteCheckout } &
    { afterpay?: AfterpayRemoteCheckout };
