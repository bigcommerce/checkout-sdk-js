import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';

export default class NoopEmbeddedCheckoutMessenger implements EmbeddedCheckoutMessenger {
    postComplete(): void {}

    postError(): void {}

    postFrameError(): void {}

    postFrameLoaded(): void {}

    postLoaded(): void {}

    receiveStyles(): void {}
}
