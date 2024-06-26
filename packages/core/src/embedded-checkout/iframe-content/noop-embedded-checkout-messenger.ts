import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/payment-integration-api';

import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';

@bind
export default class NoopEmbeddedCheckoutMessenger implements EmbeddedCheckoutMessenger {
    postComplete(): void {}

    postError(): void {}

    postFrameError(): void {}

    postFrameLoaded(): void {}

    postLoaded(): void {}

    postSignedOut(): void {}

    receiveStyles(): void {}
}
