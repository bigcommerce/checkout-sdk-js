import { find } from 'lodash';

import { CheckoutSelector } from '../checkout';
import { createSelector } from '../common/selector';
import { memoizeOne } from '../common/utility';
import { GatewayOrderPayment, OrderSelector } from '../order';

import PaymentMethod from './payment-method';
import { HOSTED } from './payment-method-types';
import { ACKNOWLEDGE, FINALIZE } from './payment-status-types';

export default interface PaymentSelector {
    getPaymentId(): { providerId: string; gatewayId?: string } | undefined;
    getPaymentStatus(): string | undefined;
    getPaymentToken(): string | undefined;
    getPaymentRedirectUrl(): string | undefined;
    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    isPaymentDataSubmitted(paymentMethod?: PaymentMethod): boolean;
}

export type PaymentSelectorFactory = (
    checkout: CheckoutSelector,
    order: OrderSelector
) => PaymentSelector;

interface PaymentSelectorDependencies {
    checkout: CheckoutSelector;
    order: OrderSelector;
}

export function createPaymentSelectorFactory(): PaymentSelectorFactory {
    const getInternalPayment = createSelector(
        ({ order }: PaymentSelectorDependencies) => order.getOrderMeta,
        getOrderMeta => () => {
            const meta = getOrderMeta();

            return meta && meta.payment;
        }
    );

    const getGatewayPayment = createSelector(
        ({ order }: PaymentSelectorDependencies) => order.getOrder,
        getOrder => () => {
            const order = getOrder();

            return find(order && order.payments, ({ providerId }) =>
                providerId !== 'giftcertificate' && providerId !== 'storecredit'
            ) as GatewayOrderPayment;
        }
    );

    const getHostedPayment = createSelector(
        ({ checkout }: PaymentSelectorDependencies) => checkout.getCheckout,
        getCheckout => () => {
            const checkout = getCheckout();

            return find(checkout && checkout.payments, ({ providerType }) =>
                providerType === HOSTED
            );
        }
    );

    const getPaymentId = createSelector(
        getInternalPayment,
        getHostedPayment,
        getGatewayPayment,
        (getInternalPayment, getHostedPayment, getGatewayPayment) => () => {
            const internalPayment = getInternalPayment();

            if (internalPayment && internalPayment.id) {
                return {
                    providerId: internalPayment.id,
                    gatewayId: internalPayment.gateway,
                };
            }

            const payment = getHostedPayment() || getGatewayPayment();

            if (payment && payment.providerId) {
                return {
                    providerId: payment.providerId,
                    gatewayId: payment.gatewayId,
                };
            }
        }
    );

    const getPaymentStatus = createSelector(
        getInternalPayment,
        getHostedPayment,
        getGatewayPayment,
        (getInternalPayment, getHostedPayment, getGatewayPayment) => () => {
            const internalPayment = getInternalPayment();

            if (internalPayment && internalPayment.status) {
                return internalPayment.status.replace('PAYMENT_STATUS_', '');
            }

            const payment = getHostedPayment() || getGatewayPayment();

            if (payment) {
                return payment.detail.step;
            }
        }
    );

    const getPaymentToken = createSelector(
        ({ order }: PaymentSelectorDependencies) => order.getOrderMeta,
        getOrderMeta => () => {
            const meta = getOrderMeta();

            return meta && meta.token;
        }
    );

    const getPaymentRedirectUrl = createSelector(
        getInternalPayment,
        getInternalPayment => () => {
            const payment = getInternalPayment();

            return payment && payment.redirectUrl;
        }
    );

    const isPaymentDataRequired = createSelector(
        ({ checkout }: PaymentSelectorDependencies) => checkout.getGrandTotal,
        getGrandTotal => (useStoreCredit: boolean = false) => {
            const grandTotal = getGrandTotal(useStoreCredit);

            return grandTotal ? grandTotal > 0 : false;
        }
    );

    const isPaymentDataSubmitted = createSelector(
        getPaymentStatus,
        getPaymentStatus => (paymentMethod?: PaymentMethod) => {
            if (paymentMethod && paymentMethod.nonce) {
                return true;
            }

            return getPaymentStatus() === ACKNOWLEDGE || getPaymentStatus() === FINALIZE;
        }
    );

    return memoizeOne((
        checkout: CheckoutSelector,
        order: OrderSelector
    ): PaymentSelector => {
        return {
            getPaymentId: getPaymentId({ checkout, order }),
            getPaymentStatus: getPaymentStatus({ checkout, order }),
            getPaymentToken: getPaymentToken({ checkout, order }),
            getPaymentRedirectUrl: getPaymentRedirectUrl({ checkout, order }),
            isPaymentDataRequired: isPaymentDataRequired({ checkout, order }),
            isPaymentDataSubmitted: isPaymentDataSubmitted({ checkout, order }),
        };
    });
}
