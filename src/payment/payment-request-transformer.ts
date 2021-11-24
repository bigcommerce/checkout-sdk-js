import { pick } from 'lodash';

import { mapToInternalAddress } from '../address';
import { mapToInternalCart } from '../cart';
import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { mapToInternalCustomer } from '../customer';
import { HostedFormOrderData } from '../hosted-form';
import { CardExpiryFormatter, CardNumberFormatter, HostedInputValues } from '../hosted-form/iframe-content';
import { mapToInternalOrder } from '../order';
import { mapToInternalShippingOption } from '../shipping';

import isVaultedInstrument, { isFormattedVaultedInstrument } from './is-vaulted-instrument';
import Payment, { HostedCreditCardInstrument, HostedVaultedInstrument, PaymentInstrument } from './payment';
import PaymentMethod from './payment-method';
import PaymentRequestBody from './payment-request-body';

export default class PaymentRequestTransformer {
    private _cardExpiryFormatter = new CardExpiryFormatter();
    private _cardNumberFormatter = new CardNumberFormatter();

    transform(payment: Payment, checkoutState: InternalCheckoutSelectors): PaymentRequestBody {
        const billingAddress = checkoutState.billingAddress.getBillingAddress();
        const checkout = checkoutState.checkout.getCheckout();
        const customer = checkoutState.customer.getCustomer();
        const order = checkoutState.order.getOrder();
        const paymentMethod = checkoutState.paymentMethods.getPaymentMethod(payment.methodId, payment.gatewayId);
        const shippingAddress = checkoutState.shippingAddress.getShippingAddress();
        const consignments = checkoutState.consignments.getConsignments();
        const shippingOption = checkoutState.consignments.getShippingOption();
        const storeConfig = checkoutState.config.getStoreConfig();
        const contextConfig = checkoutState.config.getContextConfig();
        const instrumentMeta = checkoutState.instruments.getInstrumentsMeta();
        const paymentMeta = checkoutState.paymentMethods.getPaymentMethodsMeta();
        const orderMeta = checkoutState.order.getOrderMeta();
        const internalCustomer = customer && billingAddress && mapToInternalCustomer(customer, billingAddress);

        const authToken = instrumentMeta && payment.paymentData &&
            (isVaultedInstrument(payment.paymentData) || isFormattedVaultedInstrument(payment.paymentData)) ?
            `${checkoutState.payment.getPaymentToken()}, ${instrumentMeta.vaultAccessToken}` :
            checkoutState.payment.getPaymentToken();

        if (!authToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        return {
            additionalAction: payment.additionalAction,
            authToken,
            customer: internalCustomer,
            billingAddress: billingAddress && mapToInternalAddress(billingAddress),
            shippingAddress: shippingAddress && mapToInternalAddress(shippingAddress, consignments),
            shippingOption: shippingOption && mapToInternalShippingOption(shippingOption, true),
            cart: checkout && mapToInternalCart(checkout),
            order: order && mapToInternalOrder(order, orderMeta),
            orderMeta,
            payment: payment.paymentData,
            paymentMethod: paymentMethod && this._transformPaymentMethod(paymentMethod),
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

    transformWithHostedFormData(values: HostedInputValues, data: HostedFormOrderData, nonce: string): PaymentRequestBody {
        const { additionalAction, authToken, checkout, config, order, orderMeta, payment = {}, paymentMethod, paymentMethodMeta } = data;
        const consignment = checkout && checkout.consignments[0];
        const shippingAddress = consignment && consignment.shippingAddress;
        const shippingOption = consignment && consignment.selectedShippingOption;

        return {
            additionalAction,
            authToken,
            paymentMethod: paymentMethod && this._transformPaymentMethod(paymentMethod),
            customer: order && order.billingAddress && checkout && mapToInternalCustomer(checkout.customer, order.billingAddress),
            billingAddress: order && order.billingAddress && mapToInternalAddress(order.billingAddress),
            shippingAddress: shippingAddress && checkout && mapToInternalAddress(shippingAddress, checkout.consignments),
            shippingOption: shippingOption && mapToInternalShippingOption(shippingOption, true),
            cart: checkout && mapToInternalCart(checkout),
            order: order && mapToInternalOrder(order, orderMeta),
            orderMeta,
            payment: this._transformHostedInputValues(values, payment, nonce),
            quoteMeta: {
                request: {
                    ...paymentMethodMeta,
                    geoCountryCode: config && config.context.geoCountryCode,
                },
            },
            source: 'bigcommerce-checkout-js-sdk',
            store: config && pick(config.storeConfig.storeProfile, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    }

    private _transformPaymentMethod(paymentMethod: PaymentMethod): PaymentMethod {
        if (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) {
            return { ...paymentMethod, gateway: paymentMethod.id };
        }

        if (paymentMethod.initializationData && paymentMethod.initializationData.gateway) {
            return { ...paymentMethod, id: paymentMethod.initializationData.gateway };
        }

        return paymentMethod;
    }

    private _transformHostedInputValues(
        values: HostedInputValues,
        payment: HostedCreditCardInstrument | HostedVaultedInstrument,
        nonce: string
    ): PaymentInstrument {
        return 'instrumentId' in payment ?
            {
                ...payment,
                ccCvv: values.cardCodeVerification,
                ccNumber: values.cardNumberVerification && this._cardNumberFormatter.unformat(values.cardNumberVerification),
                hostedFormNonce: nonce,
            } :
            {
                ...payment,
                ccCvv: values.cardCode,
                ccExpiry: this._cardExpiryFormatter.toObject(values.cardExpiry || ''),
                ccName: values.cardName || '',
                ccNumber: this._cardNumberFormatter.unformat(values.cardNumber || ''),
                hostedFormNonce: nonce,
            };
    }
}
