import { getBillingAddress } from '../billing/billing-addresses.mock';
import { getCheckout } from '../checkout/checkouts.mock';

import { getSubmittedOrder } from './internal-orders.mock';
import mapFromInternalOrder from './map-from-internal-order';
import mapToInternalOrder from './map-to-internal-order';

describe('mapFromInternalOrder()', () => {
    const checkout = getCheckout();
    const billingAddress = getBillingAddress();

    it('maps order identity and totals from internal order', () => {
        const internalOrder = getSubmittedOrder();

        expect(mapFromInternalOrder(internalOrder, checkout, billingAddress)).toEqual(
            expect.objectContaining({
                orderId: internalOrder.orderId,
                status: 'AWAITING_FULFILLMENT',
                isComplete: internalOrder.isComplete,
                hasDigitalItems: internalOrder.hasDigitalItems,
                isDownloadable: internalOrder.isDownloadable,
                customerCanBeCreated: internalOrder.customerCanBeCreated,
                baseAmount: internalOrder.subtotal.amount,
                discountAmount: internalOrder.discount.amount,
                handlingCostTotal: internalOrder.handling.amount,
                shippingCostTotal: internalOrder.shipping.amount,
                shippingCostBeforeDiscount: internalOrder.shipping.amountBeforeDiscount,
                orderAmount: internalOrder.grandTotal.amount,
                orderAmountAsInteger: internalOrder.grandTotal.integerAmount,
                taxes: internalOrder.taxes,
                taxTotal: internalOrder.taxTotal.amount,
            }),
        );
    });

    it('takes cart related data from checkout', () => {
        expect(mapFromInternalOrder(getSubmittedOrder(), checkout, billingAddress)).toEqual(
            expect.objectContaining({
                cartId: checkout.cart.id,
                channelId: checkout.channelId,
                coupons: checkout.coupons,
                currency: checkout.cart.currency,
                customerId: checkout.cart.customerId,
                customerMessage: checkout.customerMessage,
                isTaxIncluded: checkout.cart.isTaxIncluded,
                lineItems: checkout.cart.lineItems,
                totalDiscount: checkout.totalDiscount,
            }),
        );
    });

    it('omits billing address id', () => {
        const order = mapFromInternalOrder(getSubmittedOrder(), checkout, billingAddress);

        expect(order.billingAddress).not.toHaveProperty('id');
        expect(order.billingAddress.email).toBe(billingAddress.email);
    });

    it('does not provide data that cannot be inferred', () => {
        const order = mapFromInternalOrder(getSubmittedOrder(), checkout, billingAddress);

        expect(order.bundledItems).toBeUndefined();
        expect(order.consignments).toBeUndefined();
    });

    it('maps fees from checkout', () => {
        const order = mapFromInternalOrder(
            getSubmittedOrder(),
            {
                ...checkout,
                fees: [
                    {
                        id: '7',
                        type: 'custom_fee',
                        name: 'Fee',
                        displayName: 'Handling fee',
                        cost: 2,
                        source: 'manual',
                    },
                ],
            },
            billingAddress,
        );

        expect(order.fees).toEqual([
            {
                id: 7,
                type: 'custom_fee',
                customerDisplayName: 'Handling fee',
                cost: 2,
                source: 'manual',
            },
        ]);
    });

    describe('payments', () => {
        it('maps applied gift certificates and store credit', () => {
            const order = mapFromInternalOrder(
                {
                    ...getSubmittedOrder(),
                    giftCertificate: {
                        totalDiscountedAmount: 30,
                        appliedGiftCertificates: {
                            GC1: {
                                code: 'GC1',
                                discountedAmount: 30,
                                remainingBalance: 70,
                            },
                        },
                    },
                    storeCredit: { amount: 12 },
                },
                checkout,
                billingAddress,
            );

            expect(order.payments).toEqual([
                {
                    providerId: 'giftcertificate',
                    description: 'Gift Certificate',
                    amount: 30,
                    detail: { code: 'GC1', remaining: 70 },
                },
                {
                    providerId: 'storecredit',
                    description: 'Store Credit',
                    amount: 12,
                },
            ]);
        });

        it('supports applied gift certificates serialized as a list', () => {
            const order = mapFromInternalOrder(
                {
                    ...getSubmittedOrder(),
                    giftCertificate: {
                        totalDiscountedAmount: 30,
                        appliedGiftCertificates: [
                            { code: 'GC1', discountedAmount: 30, remainingBalance: 70 },
                        ] as any,
                    },
                    storeCredit: { amount: 0 },
                },
                checkout,
                billingAddress,
            );

            expect(order.payments).toEqual([
                expect.objectContaining({ providerId: 'giftcertificate', amount: 30 }),
            ]);
        });

        it('skips payments with no amount', () => {
            const order = mapFromInternalOrder(
                {
                    ...getSubmittedOrder(),
                    giftCertificate: { totalDiscountedAmount: 0, appliedGiftCertificates: {} },
                    storeCredit: { amount: 0 },
                },
                checkout,
                billingAddress,
            );

            expect(order.payments).toEqual([]);
        });
    });

    it('produces an order that maps back to the same payment related data', () => {
        const internalOrder = getSubmittedOrder();
        const order = mapFromInternalOrder(internalOrder, checkout, billingAddress);
        const mapped = mapToInternalOrder(
            { ...order, lineItems: { ...order.lineItems } },
            { orderToken: internalOrder.token, callbackUrl: internalOrder.callbackUrl },
        );

        expect(mapped).toEqual(
            expect.objectContaining({
                orderId: internalOrder.orderId,
                token: internalOrder.token,
                callbackUrl: internalOrder.callbackUrl,
                subtotal: internalOrder.subtotal,
                shipping: expect.objectContaining({ amount: internalOrder.shipping.amount }),
                handling: internalOrder.handling,
                taxTotal: internalOrder.taxTotal,
                grandTotal: internalOrder.grandTotal,
            }),
        );
    });
});
