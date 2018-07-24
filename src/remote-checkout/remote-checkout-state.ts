import { AfterpayRemoteCheckout, AmazonPayRemoteCheckout } from './methods';

export default interface RemoteCheckoutState {
    data: RemoteCheckoutStateData;
}

export type RemoteCheckoutStateData =
    { amazon?: AmazonPayRemoteCheckout } &
    { afterpay?: AfterpayRemoteCheckout };
