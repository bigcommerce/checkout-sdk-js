import { AfterpayRemoteCheckout, AmazonPayRemoteCheckout } from './methods';

export default interface RemoteCheckoutState {
    data: RemoteCheckoutStateData;
}

export type RemoteCheckoutStateData =
    { amazon?: AmazonPayRemoteCheckout } &
    { afterpay?: AfterpayRemoteCheckout };

export const DEFAULT_STATE: RemoteCheckoutState = {
    data: {},
};
