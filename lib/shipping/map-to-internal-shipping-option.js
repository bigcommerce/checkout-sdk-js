"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapToInternalShippingOption(option, existingOption) {
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
exports.default = mapToInternalShippingOption;
//# sourceMappingURL=map-to-internal-shipping-option.js.map