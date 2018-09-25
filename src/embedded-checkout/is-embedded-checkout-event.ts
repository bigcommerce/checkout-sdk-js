import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventType } from './embedded-checkout-events';

export default function isEmbeddedCheckoutEvent(object: any): object is EmbeddedCheckoutEvent {
    return Object.keys(EmbeddedCheckoutEventType)
        .map((key: any) => EmbeddedCheckoutEventType[key])
        .indexOf(object && object.type) >= 0;
}
