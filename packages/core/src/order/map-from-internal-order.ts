import { omit } from 'lodash';

import { BillingAddress } from '../billing';
import { Checkout } from '../checkout';
import { Fee } from '../fee';

import InternalOrder from './internal-order';
import Order, { OrderFee, OrderPayments } from './order';

export default function mapFromInternalOrder(
    internalOrder: InternalOrder,
    checkout: Checkout,
    billingAddress: BillingAddress,
): Order {
    const { cart } = checkout;

    return {
        baseAmount: internalOrder.subtotal.amount,
        billingAddress: omit(billingAddress, 'id'),
        cartId: cart.id,
        channelId: checkout.channelId,
        comparisonShippingCost: checkout.comparisonShippingCost,
        coupons: checkout.coupons,
        currency: cart.currency,
        customerCanBeCreated: internalOrder.customerCanBeCreated,
        customerId: cart.customerId,
        customerMessage: checkout.customerMessage,
        discountAmount: internalOrder.discount.amount,
        displayDiscountTotal: checkout.displayDiscountTotal,
        fees: checkout.fees.map(mapToOrderFee),
        giftWrappingCostTotal: checkout.giftWrappingCostTotal,
        handlingCostTotal: internalOrder.handling.amount,
        hasDigitalItems: internalOrder.hasDigitalItems,
        isComplete: internalOrder.isComplete,
        isDownloadable: internalOrder.isDownloadable,
        isTaxIncluded: cart.isTaxIncluded,
        lineItems: cart.lineItems,
        manualDiscountTotal: checkout.manualDiscountTotal,
        orderAmount: internalOrder.grandTotal.amount,
        orderAmountAsInteger: internalOrder.grandTotal.integerAmount,
        orderBasedAutoDiscountTotal: checkout.orderBasedAutoDiscountTotal,
        orderId: internalOrder.orderId,
        payments: mapToPayments(internalOrder),
        shippingCostBeforeDiscount: internalOrder.shipping.amountBeforeDiscount,
        shippingCostTotal: internalOrder.shipping.amount,
        status: internalOrder.status.replace(/^ORDER_STATUS_/, ''),
        taxes: internalOrder.taxes,
        taxTotal: internalOrder.taxTotal.amount,
        totalDiscount: checkout.totalDiscount,
    } as Order;
}

function mapToOrderFee(fee: Fee): OrderFee {
    return {
        id: Number(fee.id),
        type: fee.type,
        customerDisplayName: fee.displayName,
        cost: fee.cost,
        source: fee.source,
    };
}

function mapToPayments({ giftCertificate, storeCredit }: InternalOrder): OrderPayments {
    const giftCertificates = Object.values(giftCertificate?.appliedGiftCertificates ?? {}).map(
        ({ code, discountedAmount, remainingBalance }) => ({
            providerId: 'giftcertificate',
            description: 'Gift Certificate',
            amount: discountedAmount,
            detail: { code, remaining: remainingBalance },
        }),
    );

    const storeCredits = [
        {
            providerId: 'storecredit',
            description: 'Store Credit',
            amount: storeCredit?.amount ?? 0,
        },
    ];

    return [...giftCertificates, ...storeCredits].filter(
        ({ amount }) => amount > 0,
    ) as OrderPayments;
}
