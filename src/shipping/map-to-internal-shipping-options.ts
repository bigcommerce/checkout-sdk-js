import Consignment from './consignment';
import { InternalShippingOptionList } from './internal-shipping-option';
import mapToInternalShippingOption from './map-to-internal-shipping-option';

export default function mapToInternalShippingOptions(consignments: Consignment[], existingOptions: InternalShippingOptionList): InternalShippingOptionList {
    return consignments.reduce((result, consignment) => ({
        ...result,
        [consignment.id]: (consignment.availableShippingOptions || []).map(option =>
            mapToInternalShippingOption(
                option,
                option.id === consignment.selectedShippingOptionId
            )
        ),
    }), {});
}
