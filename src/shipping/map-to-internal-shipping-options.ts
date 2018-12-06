import Consignment from './consignment';
import { InternalShippingOptionList } from './internal-shipping-option';
import mapToInternalShippingOption from './map-to-internal-shipping-option';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalShippingOptions(consignments: Consignment[]): InternalShippingOptionList {
    return consignments.reduce((result, consignment) => {
        let shippingOptions;

        if (consignment.availableShippingOptions && consignment.availableShippingOptions.length) {
            shippingOptions = consignment.availableShippingOptions;
        } else if (consignment.selectedShippingOption) {
            shippingOptions = [consignment.selectedShippingOption];
        }

        return {
            ...result,
            [consignment.id]: (shippingOptions || []).map(option => {
                const selectedOptionId = consignment.selectedShippingOption && consignment.selectedShippingOption.id;

                return mapToInternalShippingOption(
                    option,
                    option.id === selectedOptionId
                );
            }),
        };
    }, {});
}
