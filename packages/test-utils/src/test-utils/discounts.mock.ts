import { Discount } from 'packages/payment-integration/src/discount';

export function getDiscount(): Discount {
    return {
        id: '12e11c8f-7dce-4da3-9413-b649533f8bad',
        discountedAmount: 10,
    };
}
