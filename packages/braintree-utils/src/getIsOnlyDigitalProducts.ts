import { Cart } from '@bigcommerce/checkout-sdk/payment-integration-api';

export default function getIsOnlyDigitalProduct(cart: Cart): boolean {
    // eslint-disable-next-line @typescript-eslint/no-useless-default-assignment
    const { physicalItems = [], digitalItems = [], customItems = [] } = cart.lineItems;

    return physicalItems?.length === 0 && customItems?.length === 0 && digitalItems?.length > 0;
}
