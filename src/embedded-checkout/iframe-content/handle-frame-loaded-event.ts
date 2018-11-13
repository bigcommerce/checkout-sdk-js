import { EmbeddedCheckoutFrameLoadedEvent } from '../embedded-checkout-events';

export default function handleFrameLoadedEvent(message: EmbeddedCheckoutFrameLoadedEvent): void {
    if (!message.payload || !message.payload.contentId) {
        return;
    }

    const body = document.getElementById(message.payload.contentId);

    if (!body || body.hasAttribute('data-iframe-height')) {
        return;
    }

    body.setAttribute('data-iframe-height', '');
}
