import { mapToInternalAddress, InternalAddress } from '../address';
import { Checkout } from '../checkout';

import InternalQuote from './internal-quote';

export default function mapToInternalQuote(checkout: Checkout): InternalQuote {
    const consignment = checkout.consignments && checkout.consignments[0];

    return {
        orderComment: checkout.customerMessage,
        shippingOption: consignment && consignment.selectedShippingOption ? consignment.selectedShippingOption.id : undefined,
        billingAddress: checkout.billingAddress ? mapToInternalAddress(checkout.billingAddress) : {} as InternalAddress,
        shippingAddress: consignment ? mapToInternalAddress(consignment.shippingAddress, consignment.id) : undefined,
    };
}
