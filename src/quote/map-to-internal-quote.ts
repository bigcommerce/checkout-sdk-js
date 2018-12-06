import { mapToInternalAddress, Address, InternalAddress } from '../address';
import { Checkout } from '../checkout';

import InternalQuote from './internal-quote';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalQuote(checkout: Checkout, shippingAddress?: Address): InternalQuote {
    const consignment = checkout.consignments && checkout.consignments[0];

    return {
        orderComment: checkout.customerMessage,
        shippingOption: consignment && consignment.selectedShippingOption ? consignment.selectedShippingOption.id : undefined,
        billingAddress: checkout.billingAddress ? mapToInternalAddress(checkout.billingAddress) : {} as InternalAddress,
        shippingAddress: shippingAddress && mapToInternalAddress(shippingAddress, checkout.consignments),
    };
}
