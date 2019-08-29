import { pick } from 'lodash';

import { mapToInternalAddress } from '../address';
import { mapToInternalCart } from '../cart';
import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { mapToInternalCustomer } from '../customer';
import { mapToInternalOrder } from '../order';
import { mapToInternalShippingOption } from '../shipping';

import isVaultedInstrument from './is-vaulted-instrument';
import Payment from './payment';
import PaymentMethod from './payment-method';
import PaymentMethodSelector from './payment-method-selector';
import PaymentRequestBody from './payment-request-body';

export default class PaymentRequestTransformer {
    transform(payment: Payment, checkoutState: InternalCheckoutSelectors): PaymentRequestBody {
        const billingAddress = checkoutState.billingAddress.getBillingAddress();
        const checkout = checkoutState.checkout.getCheckout();
        const customer = checkoutState.customer.getCustomer();
        const order = checkoutState.order.getOrder();
        const paymentMethod = this._getPaymentMethod(checkoutState.paymentMethods, payment.methodId, payment.gatewayId);
        const shippingAddress = checkoutState.shippingAddress.getShippingAddress();
        const consignments = checkoutState.consignments.getConsignments();
        const shippingOption = checkoutState.consignments.getShippingOption();
        const storeConfig = checkoutState.config.getStoreConfig();
        const contextConfig = checkoutState.config.getContextConfig();
        const instrumentMeta = checkoutState.instruments.getInstrumentsMeta();
        const paymentMeta = checkoutState.paymentMethods.getPaymentMethodsMeta();
        const orderMeta = checkoutState.order.getOrderMeta();
        const internalCustomer = customer && billingAddress && mapToInternalCustomer(customer, billingAddress);

        const authToken = instrumentMeta && payment.paymentData && isVaultedInstrument(payment.paymentData) ?
            `${checkoutState.payment.getPaymentToken()}, ${instrumentMeta.vaultAccessToken}` :
            checkoutState.payment.getPaymentToken();

        if (!authToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        return {
            authToken,
            paymentMethod,
            customer: internalCustomer,
            billingAddress: billingAddress && mapToInternalAddress(billingAddress),
            shippingAddress: shippingAddress && mapToInternalAddress(shippingAddress, consignments),
            shippingOption: shippingOption && mapToInternalShippingOption(shippingOption, true),
            cart: checkout && mapToInternalCart(checkout),
            order: order && mapToInternalOrder(order, orderMeta),
            orderMeta,
            payment: payment.paymentData,
            quoteMeta: {
                request: {
                    ...paymentMeta,
                    geoCountryCode: contextConfig && contextConfig.geoCountryCode,
                },
            },
            source: 'bigcommerce-checkout-js-sdk',
            store: pick(storeConfig && storeConfig.storeProfile, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }

    private _getPaymentMethod(
        paymentMethodSelector: PaymentMethodSelector,
        methodId: string,
        gatewayId?: string
    ): PaymentMethod | undefined {
        const paymentMethod = paymentMethodSelector.getPaymentMethod(methodId, gatewayId);

        if (!paymentMethod) {
            return;
        }

        if (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) {
            return { ...paymentMethod, gateway: paymentMethod.id };
        }

        if (paymentMethod.initializationData && paymentMethod.initializationData.gateway) {
            return { ...paymentMethod, id: paymentMethod.initializationData.gateway };
        }

        return paymentMethod;
    }
}
