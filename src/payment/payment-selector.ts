import { find } from 'lodash';

import { CheckoutPayment, CheckoutSelector } from '../checkout';
import { selector } from '../common/selector';
import { GatewayOrderPayment, InternalOrderPayment, OrderSelector } from '../order';

import PaymentMethod from './payment-method';
import { HOSTED } from './payment-method-types';
import { ACKNOWLEDGE, FINALIZE } from './payment-status-types';

@selector
export default class PaymentSelector {
    constructor(
        private _checkout: CheckoutSelector,
        private _order: OrderSelector
    ) {}

    getPaymentId(): { providerId: string; gatewayId?: string } | undefined {
        const internalPayment = this._getInternalPayment();

        if (internalPayment && internalPayment.id) {
            return {
                providerId: internalPayment.id,
                gatewayId: internalPayment.gateway,
            };
        }

        const payment = this._getHostedPayment() || this._getGatewayPayment();

        if (payment && payment.providerId) {
            return {
                providerId: payment.providerId,
                gatewayId: payment.gatewayId,
            };
        }
    }

    getPaymentStatus(): string | undefined {
        const internalPayment = this._getInternalPayment();

        if (internalPayment && internalPayment.status) {
            return internalPayment.status.replace('PAYMENT_STATUS_', '');
        }

        const payment = this._getHostedPayment() || this._getGatewayPayment();

        if (payment) {
            return payment.detail.step;
        }
    }

    getPaymentToken(): string | undefined {
        const meta = this._order.getOrderMeta();

        return meta && meta.token;
    }

    getPaymentRedirectUrl(): string | undefined {
        const payment = this._getInternalPayment();

        return payment && payment.redirectUrl;
    }

    isPaymentDataRequired(useStoreCredit: boolean = false): boolean {
        const grandTotal = this._checkout.getGrandTotal(useStoreCredit);

        return grandTotal ? grandTotal > 0 : false;
    }

    isPaymentDataSubmitted(paymentMethod?: PaymentMethod): boolean {
        if (paymentMethod && paymentMethod.nonce) {
            return true;
        }

        return this.getPaymentStatus() === ACKNOWLEDGE || this.getPaymentStatus() === FINALIZE;
    }

    private _getInternalPayment(): InternalOrderPayment | undefined {
        const meta = this._order.getOrderMeta();

        return meta && meta.payment;
    }

    private _getGatewayPayment(): GatewayOrderPayment | undefined {
        const order = this._order.getOrder();

        return find(order && order.payments, ({ providerId }) =>
            providerId !== 'giftcertificate' && providerId !== 'storecredit'
        ) as GatewayOrderPayment;
    }

    private _getHostedPayment(): CheckoutPayment | undefined {
        const checkout = this._checkout.getCheckout();

        return find(checkout && checkout.payments, ({ providerType }) =>
            providerType === HOSTED
        );
    }
}
