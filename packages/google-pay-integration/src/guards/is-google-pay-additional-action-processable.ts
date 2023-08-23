import GooglePayGateway from '../gateways/google-pay-gateway';
import { GooglePayAdditionalActionProcessable } from '../types';

export default function isGooglePayAdditionalActionProcessable(
    gateway: GooglePayGateway,
): gateway is GooglePayGateway & GooglePayAdditionalActionProcessable {
    return 'processAdditionalAction' in gateway;
}
