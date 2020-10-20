
export interface ApproveDataOptions {
    orderID: string;
}

export interface ClickDataOptions {
    fundingSource: string;
}

export interface ClickActions {
    reject(): Promise<void>;
    resolve(): Promise<void>;
}

export interface OrderData {
    orderId: string;
    approveUrl: string;
}

export enum StyleButtonLabel {
    paypal = 'paypal',
    checkout = 'checkout',
    buynow = 'buynow',
    pay = 'pay',
    installment = 'installment',
}

export enum StyleButtonLayout {
    vertical = 'vertical',
    horizontal = 'horizontal',
}

export enum StyleButtonColor {
    gold = 'gold',
    blue = 'blue',
    silver = 'silver',
    black = 'black',
    white = 'white',
}

export enum StyleButtonShape {
    pill = 'pill',
    rect = 'rect' ,
}

export interface PaypalButtonStyleOptions {
    layout?: StyleButtonLayout;
    color?: StyleButtonColor;
    shape?: StyleButtonShape;
    height?: 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55;
    label?: StyleButtonLabel;
    tagline?: boolean;
}

export interface ButtonsOptions {
    style?: PaypalButtonStyleOptions;
    fundingSource?: string;
    createOrder?(): Promise<string>;
    onApprove?(data: ApproveDataOptions): void;
    onClick?(data: ClickDataOptions, actions: ClickActions): void;
}

export interface MessagesOptions {
    amount: number;
    placement: string;
    style?: MessagesStyleOptions;
    fundingSource?: string;
}

export interface MessagesStyleOptions {
    layout?: string;
}

export interface PaypalCommerceHostedFieldOption {
    selector: string;
    placeholder?: string;
}

export interface PaypalCommerceHostedFieldsRenderOptions {
    fields?: {
        number?: PaypalCommerceHostedFieldOption;
        cvv?: PaypalCommerceHostedFieldOption;
        expirationDate?: PaypalCommerceHostedFieldOption;
    };
    paymentsSDK?: boolean;
    styles?: {
        input?: { [key: string]: string };
        '.invalid'?: { [key: string]: string };
        '.valid'?: { [key: string]: string };
        ':focus'?: { [key: string]: string };
    };
    createOrder(): Promise<string>;
}

export interface PaypalCommerceHostedFieldsSubmitOptions {
    contingencies?: Array<'3D_SECURE'>;
}

export interface PaypalCommerceHostedFieldsApprove {
    orderId: string;
    liabilityShift: 'POSSIBLE' | 'NO' | 'UNKNOWN';
}

export interface PaypalCommerceHostedFields {
    submit(options?: PaypalCommerceHostedFieldsSubmitOptions): PaypalCommerceHostedFieldsApprove;
    getState(): PaypalCommerceHostedFieldsState;
    on(eventName: string, callback: (event: PaypalCommerceHostedFieldsState) => void): void;
}

export interface PaypalCommerceHostedFieldsState {
    cards: PaypalCommerceHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: PaypalCommerceHostedFieldsFieldData;
        expirationDate?: PaypalCommerceHostedFieldsFieldData;
        expirationMonth?: PaypalCommerceHostedFieldsFieldData;
        expirationYear?: PaypalCommerceHostedFieldsFieldData;
        cvv?: PaypalCommerceHostedFieldsFieldData;
        postalCode?: PaypalCommerceHostedFieldsFieldData;
    };
}

export interface PaypalCommerceHostedFieldsCard {
    type: string;
    niceType: string;
    code: { name: string; size: number };
}

export interface PaypalCommerceHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export interface PaypalCommerceButtons {
    render(id: string): void;
    close(): void;
    isEligible(): boolean;
}

export interface PaypalCommerceMessages {
    render(id: string): void;
}

export interface PaypalCommerceSDKFunding {
    PAYPAL: string;
    CREDIT: string;
    PAYLATER: string;
    BANCONTACT: string;
    GIROPAY: string;
    P24: string;
    EPS: string;
    IDEAL: string;
    MYBANK: string;
    SOFORT: string;
    BLIK: string;
    TRUSTLY: string;
    VERKKOPANKKI: string;
}

export interface PaypalCommerceSDK {
    FUNDING: PaypalCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: PaypalCommerceHostedFieldsRenderOptions): Promise<PaypalCommerceHostedFields>;
    };
    Buttons(params: ButtonsOptions): PaypalCommerceButtons;
    Messages(params: MessagesOptions): PaypalCommerceMessages;
}

export interface PaypalCommerceHostWindow extends Window {
    paypal?: PaypalCommerceSDK;
    paypalLoadScript?(options: PaypalCommerceScriptParams): Promise<{ paypal: PaypalCommerceSDK }>;
}

export interface PaypalCommerceInitializationData {
    clientId: string;
    merchantId?: string;
    intent?: 'capture' | 'authorize';
    isPayPalCreditAvailable?: boolean;
    isProgressiveOnboardingAvailable?: boolean;
    clientToken?: string;
}

export type DisableFundingType = Array<'credit' | 'card'>;

export type ComponentsScriptType = Array<'buttons' | 'messages' | 'hosted-fields'>;

export interface PaypalCommerceScriptParams  {
    'client-id': string;
    'merchant-id'?: string;
    'disable-funding'?: DisableFundingType;
    'data-client-token'?: string;
    'partner-attribution-id'?: string;
    currency?: string;
    commit?: boolean;
    intent?: 'capture' | 'authorize';
    components?: ComponentsScriptType;
}

export enum PaymentStrategyTypes {
    credit = 'credit',
    alternative = 'alternative',
    paypal = 'paypal',
}
