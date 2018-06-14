import { mapToInternalAddress, InternalAddress } from '../address';
import { Checkout } from '../checkout';

import InternalQuote from './internal-quote';

export default function mapToInternalQuote(checkout: Checkout): InternalQuote {
    return {
        orderComment: checkout.customerMessage,
        shippingOption: checkout.consignments[0] ? checkout.consignments[0].selectedShippingOptionId : undefined,
        billingAddress: {} as InternalAddress,
        shippingAddress: checkout.consignments[0] ? mapToInternalAddress(checkout.consignments[0].shippingAddress, checkout.consignments[0].id) : undefined,
    };
}
