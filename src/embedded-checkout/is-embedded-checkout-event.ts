import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';

export default function isEmbeddedCheckoutEvent(object: any): object is EmbeddedCheckoutEvent {
    return Object.keys(EmbeddedCheckoutEventType)
        .map((key: any) => EmbeddedCheckoutEventType[key])
        .indexOf(object && object.type) >= 0;
}

export function isEmbeddedCheckoutEventType<TType extends keyof EmbeddedCheckoutEventMap>(
    event: EmbeddedCheckoutEvent,
    type: TType
): event is EmbeddedCheckoutEventMap[TType] {
    return event.type === type;
}
