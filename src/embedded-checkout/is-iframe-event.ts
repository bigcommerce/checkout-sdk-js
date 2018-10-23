import IframeEvent from './iframe-event';

export default function isIframeEvent<TEvent extends IframeEvent<TType>, TType extends string>(
    object: any,
    type: TType
): object is TEvent {
    return object.type === type;
}
