
declare interface BlockElementStyles extends InlineElementStyles {
    backgroundColor?: string;
    boxShadow?: string;
    borderColor?: string;
    borderWidth?: string;
}

declare interface BodyStyles {
    backgroundColor?: string;
}

declare interface ButtonStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

declare interface CheckableInputStyles extends InputStyles {
    error?: InputStyles;
    checked?: BlockElementStyles;
}

declare interface ChecklistStyles extends BlockElementStyles {
    hover?: BlockElementStyles;
    checked?: BlockElementStyles;
}

declare class EmbeddedCheckout {
    private _iframeCreator;
    private _messageListener;
    private _messagePoster;
    private _loadingIndicator;
    private _requestSender;
    private _storage;
    private _location;
    private _options;
    private _iframe?;
    private _isAttached;
    attach(): Promise<this>;
    detach(): void;
    private _configureStyles;
    private _attemptLogin;
    /**
     * This workaround is required for certain browsers (namely Safari) that
     * prevent session cookies to be set for a third party website unless the
     * user has recently visited such website. Therefore, before we attempt to
     * login or set an active cart in the session, we need to first redirect the
     * user to the domain of Embedded Checkout.
     */
    private _allowCookie;
    private _retryAllowCookie;
}

declare interface EmbeddedCheckoutCompleteEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
}

declare interface EmbeddedCheckoutError {
    message: string;
    type?: string;
    subtype?: string;
}

declare interface EmbeddedCheckoutErrorEvent {
    type: EmbeddedCheckoutEventType.CheckoutError;
    payload: EmbeddedCheckoutError;
}

declare enum EmbeddedCheckoutEventType {
    CheckoutComplete = "CHECKOUT_COMPLETE",
    CheckoutError = "CHECKOUT_ERROR",
    CheckoutLoaded = "CHECKOUT_LOADED",
    FrameError = "FRAME_ERROR",
    FrameLoaded = "FRAME_LOADED",
    SignedOut = "SIGNED_OUT"
}

declare interface EmbeddedCheckoutFrameErrorEvent {
    type: EmbeddedCheckoutEventType.FrameError;
    payload: EmbeddedCheckoutError;
}

declare interface EmbeddedCheckoutFrameLoadedEvent {
    type: EmbeddedCheckoutEventType.FrameLoaded;
    payload?: EmbeddedContentOptions;
}

declare interface EmbeddedCheckoutLoadedEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

declare interface EmbeddedCheckoutOptions {
    containerId: string;
    url: string;
    styles?: EmbeddedCheckoutStyles;
    onComplete?(event: EmbeddedCheckoutCompleteEvent): void;
    onError?(event: EmbeddedCheckoutErrorEvent): void;
    onFrameError?(event: EmbeddedCheckoutFrameErrorEvent): void;
    onFrameLoad?(event: EmbeddedCheckoutFrameLoadedEvent): void;
    onLoad?(event: EmbeddedCheckoutLoadedEvent): void;
    onSignOut?(event: EmbeddedCheckoutSignedOutEvent): void;
}

declare interface EmbeddedCheckoutSignedOutEvent {
    type: EmbeddedCheckoutEventType.SignedOut;
}

declare interface EmbeddedCheckoutStyles {
    body?: BodyStyles;
    text?: InlineElementStyles;
    heading?: BlockElementStyles;
    secondaryHeading?: BlockElementStyles;
    link?: LinkStyles;
    secondaryText?: InlineElementStyles;
    button?: ButtonStyles;
    secondaryButton?: ButtonStyles;
    input?: TextInputStyles;
    select?: InputStyles;
    radio?: CheckableInputStyles;
    checkbox?: CheckableInputStyles;
    label?: LabelStyles;
    checklist?: ChecklistStyles;
    discountBanner?: BlockElementStyles;
    loadingBanner?: BlockElementStyles;
    loadingIndicator?: LoadingIndicatorStyles;
    orderSummary?: BlockElementStyles;
    step?: StepStyles;
}

declare interface EmbeddedContentOptions {
    contentId?: string;
}

declare interface InlineElementStyles {
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
}

declare interface InputStyles extends BlockElementStyles {
    active?: BlockElementStyles;
    error?: InputStyles;
    focus?: BlockElementStyles;
    hover?: BlockElementStyles;
    disabled?: BlockElementStyles;
}

declare interface LabelStyles extends InlineElementStyles {
    error?: InlineElementStyles;
}

declare interface LinkStyles extends InlineElementStyles {
    active?: InlineElementStyles;
    focus?: InlineElementStyles;
    hover?: InlineElementStyles;
}

declare interface LoadingIndicatorStyles {
    size?: number;
    color?: string;
    backgroundColor?: string;
}

declare interface StepStyles extends BlockElementStyles {
    icon?: BlockElementStyles;
}

declare interface TextInputStyles extends InputStyles {
    placeholder?: InlineElementStyles;
}

/**
 * Embed the checkout form in an iframe.
 *
 * @remarks
 * Once the iframe is embedded, it will automatically resize according to the
 * size of the checkout form. It will also notify the parent window when certain
 * events have occurred. i.e.: when the form is loaded and ready to be used.
 *
 * ```js
 * embedCheckout({
 *     url: 'https://checkout/url',
 *     containerId: 'container-id',
 * });
 * ```
 *
 * @param options - Options for embedding the checkout form.
 * @returns A promise that resolves to an instance of `EmbeddedCheckout`.
 */
export declare function embedCheckout(options: EmbeddedCheckoutOptions): Promise<EmbeddedCheckout>;
