import InternalShippingOption from './internal-shipping-option';
import ShippingOption from './shipping-option';

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
