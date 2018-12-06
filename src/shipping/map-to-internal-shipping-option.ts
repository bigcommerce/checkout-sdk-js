import InternalShippingOption from './internal-shipping-option';
import ShippingOption from './shipping-option';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalShippingOption(option: ShippingOption, isSelected: boolean): InternalShippingOption {
    return {
        description: option.description,
        module: option.type,
        price: option.cost,
        id: option.id,
        selected: isSelected,
        isRecommended: option.isRecommended,
        imageUrl: option.imageUrl,
        transitTime: option.transitTime,
    };
}
