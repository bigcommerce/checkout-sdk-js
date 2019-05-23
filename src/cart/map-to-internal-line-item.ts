import { AmountTransformer } from '../common/utility';

import InternalLineItem from './internal-line-item';
import { DigitalItem, LineItem } from './line-item';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalLineItem(
    item: LineItem,
    type: string,
    decimalPlaces: number,
    idKey: keyof LineItem = 'id'
): InternalLineItem {
    const amountTransformer = new AmountTransformer(decimalPlaces);

    return {
        id: (item[idKey] as string | number),
        imageUrl: item.imageUrl,
        amount: item.extendedListPrice,
        amountAfterDiscount: item.extendedSalePrice,
        discount: item.discountAmount,
        integerAmount: amountTransformer.toInteger(item.extendedListPrice),
        integerAmountAfterDiscount: amountTransformer.toInteger(item.extendedSalePrice),
        integerDiscount: amountTransformer.toInteger(item.discountAmount),
        downloadsPageUrl: (item as DigitalItem).downloadPageUrl,
        name: item.name,
        quantity: item.quantity,
        brand: item.brand,
        categoryNames: item.categoryNames,
        variantId: item.variantId,
        productId: item.productId,
        attributes: (item.options || []).map(option => ({
            name: option.name,
            value: option.value,
        })),
        addedByPromotion: item.addedByPromotion,
        type,
    };
}
