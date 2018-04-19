import Consignment from './consignment';
import InternalShippingOption from './internal-shipping-option';
import mapToInternalShippingOption from './map-to-internal-shipping-option';

export default function mapToInternalShippingOptions(consignments: Consignment[], existingOptions: { [key: string]: InternalShippingOption[] }): { [key: string]: InternalShippingOption[] } {
    return consignments.reduce((result, consignment) => ({
        ...result,
        [consignment.shippingAddress.id]: (consignment.availableShippingOptions || []).map(option =>
            mapToInternalShippingOption(
                option,
                option.id === consignment.selectedShippingOptionId
            )
        ),
    }), {});
}
