import { AfterpayRemoteCheckout } from './methods/afterpay';
import { AmazonPayRemoteCheckout } from './methods/amazon-pay';

export default interface RemoteCheckoutState {
    data: RemoteCheckoutStateData;
}

export type RemoteCheckoutStateData =
    { amazon?: AmazonPayRemoteCheckout } &
    { afterpay?: AfterpayRemoteCheckout };
