import InternalLineItem from './internal-line-item';
import { LineItem } from './line-item';
import LineItemMap from './line-item-map';
import mapGiftCertificateToInternalLineItem from './map-gift-certificate-to-internal-line-item';
import mapToInternalLineItem from './map-to-internal-line-item';

/**
 * @deprecated This mapper is only for internal use only. It is required during
 * the transition period as we are moving to adopt the new storefront API object
 * schema.
 */
export default function mapToInternalLineItems(
    itemMap: LineItemMap,
    decimalPlaces: number,
    idKey: keyof LineItem = 'id'
): InternalLineItem[] {
    return (Object.keys(itemMap) as Array<keyof LineItemMap>)
        .reduce((result, key) => [
            ...result,
            ...(itemMap[key] as LineItem[]).map((item: any) => {
                if (key === 'giftCertificates') {
                    return mapGiftCertificateToInternalLineItem(item, decimalPlaces);
                }

                return mapToInternalLineItem(
                    item,
                    mapToInternalLineItemType(key),
                    decimalPlaces,
                    idKey
                );
            }),
        ], [] as InternalLineItem[]);
}

function mapToInternalLineItemType(type: string): string {
    switch (type) {
        case 'physicalItems':
            return 'ItemPhysicalEntity';

        case 'digitalItems':
            return 'ItemDigitalEntity';

        case 'giftCertificates':
            return 'ItemGiftCertificateEntity';

        default:
            return '';
    }
}
