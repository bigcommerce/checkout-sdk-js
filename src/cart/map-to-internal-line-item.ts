import InternalLineItem from './internal-line-item';
import { LineItem } from './line-item';

export default function mapToInternalLineItem(item: LineItem, existingItem: InternalLineItem, type: string): InternalLineItem {
    return {
        amount: existingItem.amount,
        amountAfterDiscount: existingItem.amountAfterDiscount,
        attributes: existingItem.attributes,
        discount: item.discountAmount,
        id: item.id,
        imageUrl: item.imageUrl,
        integerAmount: existingItem.integerAmount,
        integerAmountAfterDiscount: existingItem.integerAmountAfterDiscount,
        integerDiscount: existingItem.integerDiscount,
        integerTax: existingItem.integerTax,
        name: item.name,
        quantity: item.quantity,
        tax: existingItem.tax,
        variantId: item.variantId,
        type,
    };
}
