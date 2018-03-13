import InternalShippingOption from './internal-shipping-option';
import ShippingOption from './shipping-option';

export default function mapToInternalShippingOption(option: ShippingOption, existingOption: InternalShippingOption): InternalShippingOption {
    return {
        description: option.description,
        module: existingOption.module,
        method: existingOption.method,
        price: option.price,
        formattedPrice: existingOption.formattedPrice,
        id: option.id,
        selected: existingOption.selected,
        isRecommended: existingOption.isRecommended,
        imageUrl: option.imageUrl,
        transitTime: option.transitTime,
    };
}
