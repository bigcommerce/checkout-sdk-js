import { Cart } from '../cart';
import { StoreConfig } from '../config';

const itemsRequireShipping = (cart?: Cart, config?: StoreConfig) => {
    if (!cart) {
        return false;
    }

    if (cart.lineItems.physicalItems.some((lineItem) => lineItem.isShippingRequired)) {
        return true;
    }

    if (config && cart.lineItems.customItems) {
        return cart.lineItems.customItems.length > 0;
    }

    return false;
};

export default itemsRequireShipping;
