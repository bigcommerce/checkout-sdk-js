import { BodlEventsPayload } from './bodl-window';

export default interface BodlService {
    checkoutBegin(): void;
    orderPurchased(): void;
    stepCompleted(step?: string): void;
    customerEmailEntry(email?: string): void;
    customerSuggestionInit(payload?: BodlEventsPayload): void;
    customerSuggestionExecute(): void;
    customerPaymentMethodExecuted(payload?: BodlEventsPayload): void;
    showShippingMethods(): void;
    selectedPaymentMethod(methodName?: string): void;
    clickPayButton(payload?: BodlEventsPayload): void;
    paymentRejected(): void;
    paymentComplete(): void;
    exitCheckout(): void;
}
