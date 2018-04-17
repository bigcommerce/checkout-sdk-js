import { find } from 'lodash';

import InternalLineItem from './internal-line-item';
import { LineItem } from './line-item';
import LineItemMap from './line-item-map';
import mapToInternalLineItem from './map-to-internal-line-item';

export default function mapToInternalLineItems(
    itemMap: LineItemMap,
    existingItems: InternalLineItem[],
    idKey: keyof LineItem = 'id'
): InternalLineItem[] {
    return (Object.keys(itemMap) as Array<keyof LineItemMap>)
        .reduce((result, key) => [
            ...result,
            ...(itemMap[key] as LineItem[]).map((item: any) => {
                const existingItem = find(existingItems, { id: item[idKey] })!;

                return mapToInternalLineItem(
                    item,
                    existingItem,
                    mapToInternalLineItemType(key),
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
