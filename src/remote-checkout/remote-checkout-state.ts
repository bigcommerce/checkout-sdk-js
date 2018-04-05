import RemoteCheckout from './remote-checkout';
import RemoteCheckoutMeta from './remote-checkout-meta';

export default interface RemoteCheckoutState {
    data?: RemoteCheckout;
    meta?: RemoteCheckoutMeta;
}
