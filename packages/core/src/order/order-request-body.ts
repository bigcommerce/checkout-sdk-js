import { CreditCardInstrument, HostedCreditCardInstrument, HostedInstrument, HostedVaultedInstrument, NonceInstrument, VaultedInstrument, WithAccountCreation, WithCheckoutcomiDealInstrument, WithCheckoutcomFawryInstrument, WithCheckoutcomSEPAInstrument, WithDocumentInstrument, WithMollieIssuerInstrument } from '../payment';

/**
 * An object that contains the information required for submitting an order.
 */
export default interface OrderRequestBody {
    /**
     * An object that contains the payment details of a customer. In some cases,
     * you can omit this object if the order does not require further payment.
     * For example, the customer is able to use their store credit to pay for
     * the entire order. Or they have already submitted their payment details
     * using PayPal.
     */
    payment?: OrderPaymentRequestBody;

    /**
     * If true, apply the store credit of the customer to the order. It only
     * works if the customer has previously signed in.
     */
    useStoreCredit?: boolean;
}

export type OrderPaymentInstrument = (
    CreditCardInstrument |
    HostedInstrument |
    HostedCreditCardInstrument |
    HostedVaultedInstrument |
    NonceInstrument |
    VaultedInstrument |
    CreditCardInstrument & WithDocumentInstrument |
    CreditCardInstrument & WithCheckoutcomFawryInstrument |
    CreditCardInstrument & WithCheckoutcomSEPAInstrument |
    CreditCardInstrument & WithCheckoutcomiDealInstrument |
    HostedInstrument & WithMollieIssuerInstrument |
    WithAccountCreation
);

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
     * An object that contains the details of a credit card, vaulted payment
     * instrument or nonce instrument.
     */
    paymentData?: OrderPaymentInstrument;
}
