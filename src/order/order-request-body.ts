import { CreditCardInstrument, VaultedInstrument } from '../payment';
import { CryptogramInstrument } from '../payment/payment';

/**
 * An object that contains the information required for submitting an order.
 */
export default interface OrderRequestBody {
    /**
     * An object that contains the payment details of a customer. In some cases,
     * you can omit this object if the order does not require further payment.
     * For example, the customer is able to use their store credit to pay for
     * the entire order. Or they have already submitted thier payment details
     * using PayPal.
     */
    payment?: OrderPaymentRequestBody;

    /**
     * If true, apply the store credit of the customer to the order. It only
     * works if the customer has previously signed in.
     */
    useStoreCredit?: boolean;
}

/**
 * An object that contains the payment information required for submitting an
 * order.
 */
export interface OrderPaymentRequestBody {
    /**
     * The identifier of the payment method that is chosen for the order.
     */
    methodId: string;

    /**
     * The identifier of the payment provider that is chosen for the order.
     */
    gatewayId?: string;

    /**
     * An object that contains the details of a credit card or vaulted payment
     * instrument.
     */
    paymentData?: CreditCardInstrument | VaultedInstrument |CryptogramInstrument;
}
