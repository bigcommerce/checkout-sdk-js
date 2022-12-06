import BodlService from './bodl-service';

export default class NoopBodlService implements BodlService {
    checkoutBegin(): void {}

    orderPurchased(): void {}

    stepCompleted(): void {}

    customerEmailEntry(): void {}

    customerSuggestionExecute(): void {}

    customerPaymentMethodExecuted(): void {}

    showShippingMethods(): void {}

    selectedPaymentMethod(): void {}

    clickPayButton(): void {}

    paymentRejected(): void {}

    paymentComplete(): void {}

    exitCheckout(): void {}
}
