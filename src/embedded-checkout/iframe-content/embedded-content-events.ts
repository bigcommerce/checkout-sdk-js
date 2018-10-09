import EmbeddedCheckoutStyles from '../embedded-checkout-styles';

export enum EmbeddedContentEventType {
    StyleConfigured = 'STYLE_CONFIGURED',
}

export interface EmbeddedContentEventMap {
    [EmbeddedContentEventType.StyleConfigured]: EmbeddedContentStyleConfiguredEvent;
}

export type EmbeddedContentEvent = (
    EmbeddedContentStyleConfiguredEvent
);

export interface EmbeddedContentStyleConfiguredEvent {
    type: EmbeddedContentEventType.StyleConfigured;
    payload: EmbeddedCheckoutStyles;
}
