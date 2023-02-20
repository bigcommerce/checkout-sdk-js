import { LineItemMap } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ExtraItemsData } from './extra-items-data';

type StorageFallback = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const ORDER_ITEMS_STORAGE_KEY = 'ORDER_ITEMS';

export default class AnalyticsExtraItemsManager {
    constructor(private storage: StorageFallback) {}

    saveExtraItemsData(id: string, lineItems: LineItemMap): ExtraItemsData {
        const data = [...lineItems.physicalItems, ...lineItems.digitalItems].reduce<ExtraItemsData>(
            (result, item) => {
                result[item.productId] = {
                    brand: item.brand ? item.brand : '',
                    category: item.categoryNames ? item.categoryNames.join(', ') : '',
                };

                return result;
            },
            {},
        );

        try {
            this.storage.setItem(this.getStorageKey(id), JSON.stringify(data));

            return data;
        } catch (err) {
            return {};
        }
    }

    readExtraItemsData(id: string): ExtraItemsData | null {
        try {
            const item = this.storage.getItem(this.getStorageKey(id));

            return item ? JSON.parse(item) : null;
        } catch (err) {
            return null;
        }
    }

    clearExtraItemData(id: string): void {
        try {
            this.storage.removeItem(this.getStorageKey(id));
        } catch (err) {
            // silently ignore the failure
        }
    }

    private getStorageKey(id: string): string {
        return id ? `${ORDER_ITEMS_STORAGE_KEY}_${id}` : '';
    }
}
