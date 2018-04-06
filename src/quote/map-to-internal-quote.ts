import { mapToInternalAddress } from '../address';
import { Checkout } from '../checkout';

import InternalQuote from './internal-quote';

export default function mapToInternalQuote(checkout: Checkout, existingQuote: InternalQuote): InternalQuote {
    return {
        orderComment: existingQuote.orderComment,
        shippingOption: checkout.consignments[0] ? checkout.consignments[0].selectedShippingOptionId : existingQuote.shippingOption,
        billingAddress: mapToInternalAddress(checkout.billingAddress),
        shippingAddress: checkout.consignments[0] ? mapToInternalAddress(checkout.consignments[0].shippingAddress) : existingQuote.shippingAddress,
    };
}
