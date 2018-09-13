import InternalLineItem from './internal-line-item';
import { DigitalItem, LineItem } from './line-item';

import { AmountTransformer } from '.';

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
        variantId: item.variantId,
        attributes: (item.options || []).map(option => ({
            name: option.name,
            value: option.value,
        })),
        addedByPromotion: item.addedByPromotion,
        type,
    };
}
