import { AmountTransformer } from '../common/utility';

import InternalLineItem from './internal-line-item';
import { GiftCertificateItem } from './line-item';

export default function mapGiftCertificateToInternalLineItem(
    item: GiftCertificateItem,
    decimalPlaces: number
): InternalLineItem {
    const amountTransformer = new AmountTransformer(decimalPlaces);

    return {
        id: item.id,
        imageUrl: '',
        name: item.name,
        amount: item.amount,
        amountAfterDiscount: item.amount,
        discount: 0,
        integerAmount: amountTransformer.toInteger(item.amount),
        integerAmountAfterDiscount: amountTransformer.toInteger(item.amount),
        integerDiscount: 0,
        quantity: 1,
        sender: item.sender,
        recipient: item.recipient,
        type: 'ItemGiftCertificateEntity',
        attributes: [],
        variantId: null,
    };
}
