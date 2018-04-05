import InternalShippingOption from './internal-shipping-option';
import ShippingOption from './shipping-option';

export default function mapToInternalShippingOption(option: ShippingOption, isSelected: boolean, existingOption: InternalShippingOption): InternalShippingOption {
    return {
        description: option.description,
        module: existingOption.module,
        price: option.price,
        id: option.id,
        selected: isSelected,
        isRecommended: option.isRecommended,
        imageUrl: option.imageUrl,
        transitTime: option.transitTime,
    };
}
