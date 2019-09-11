import { AmazonPayRemoteCheckout } from './methods';

export default interface RemoteCheckoutState {
    data: RemoteCheckoutStateData;
}

export interface RemoteCheckoutStateData {
    amazon?: AmazonPayRemoteCheckout;
}

export const DEFAULT_STATE: RemoteCheckoutState = {
    data: {},
};
