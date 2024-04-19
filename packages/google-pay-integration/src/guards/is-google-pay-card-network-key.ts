import { GooglePayCardNetwork } from '../types';

export default function isGooglePayCardNetworkKey(
    card: string,
): card is keyof typeof GooglePayCardNetwork {
    return card in GooglePayCardNetwork;
}
