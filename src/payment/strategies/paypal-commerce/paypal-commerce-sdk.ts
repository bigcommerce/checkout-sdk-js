import { Consignment } from '../../../shipping/';

export interface ApproveDataOptions {
    orderID?: string;
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

export interface OrderStatus {
    status: 'APPROVED' | 'CREATED' | string;
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
    onApprove?(data: ApproveDataOptions, actions: ApproveActions): void;
    onShippingChange?(data: any, actions: any): void;
    onClick?(data: ClickDataOptions, actions: ClickActions): void;
    onCancel?(): void;
    onError?(error: Error): void;
}

export interface ApproveActions {
    order: {
        capture(): Promise<any>;
        authorize(): Promise<any>;
        get(): void;
        patch(data: PatchArgument[]): void;
    };
    resolve(): void;
    reject(): void;
}

export interface CheckoutWithBillingAddress {
    consignments: Consignment[];
    cart: {
        id: string;
        lineItems: {
            physicalItems: PhysicalItem[];
        };
    };
}

interface PhysicalItem {
    id: string;
    imageUrl: string;
}

interface PatchArgument {
    op: string;
    path: string;
    value: PatchValue | ShippingOptions[];
}

interface PatchValue {
    currency_code: string;
    value: string | number;
    breakdown: {
        item_total: {
            value: number | string;
            currency_code: string;
        };
        shipping?: ItemTotal;
    };
}

export interface AvaliableShippingOption {
    additionalDescription: string;
    cost: number;
    id: string;
    isRecommended: boolean;
    description: string;
}

export interface PayerDetails {
        payer: {
            name: {
                given_name: string;
                surname: string;
            };
            email_address: string;
            payer_id: string;
            address: {
                country_code: string;
            };
        };
        purchase_units: PurchaseUnits[];
}

export interface ShippingChangeData {
    amount: {
        breakdown: {
            item_total: ItemTotal;
            shipping: ItemTotal;
            tax_total: ItemTotal;
        };
        currency_code: string;
        value: string;
    };
    orderID: string;
    payment_token: string;
    shipping_address: ShippingAddress;
    selected_shipping_option: {
        id: string;
        amount: ItemTotal;
    };
}

export interface ShippingAddress {
    city: string;
    postal_code: string;
    country_code: string;
    state: string;
}

interface ItemTotal {
    currency_code: string;
    value: string;
}

export interface ShippingOptions {
    id: string;
    type: string;
    label: string;
    selected: boolean;
    amount: ItemTotal;
}

export interface PurchaseUnits {
    reference_id: string;
    amount: ItemTotal;
    payee: {
        email_address: string;
        merchant_id: string;
    };
    shipping: {
        address: {
            address_line_1: string;
            address_area_1: string;
            address_area2: string;
            country_code: string;
            postal_code: string;
        };
        name: {
            full_name: string;
        };
    };
}

export interface PaypalFieldsStyleOptions {
    variables?: {
        fontFamily?: string;
        fontSizeBase?: string;
        fontSizeSm?: string;
        fontSizeM?: string;
        fontSizeLg?: string;
        textColor?: string;
        colorTextPlaceholder?: string;
        colorBackground?: string;
        colorInfo?: string;
        colorDanger?: string;
        borderRadius?: string;
        borderColor?: string;
        borderWidth?: string;
        borderFocusColor?: string;
        spacingUnit?: string;
    };
    rules?: {
        [key: string]: any;
    };
}

export interface FieldsOptions {
    style?: PaypalFieldsStyleOptions;
    fundingSource: string;
    fields: { name?: { value?: string }; email?: { value?: string } };
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
    cardholderName?: string;
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

export interface PaypalCommerceFields {
    render(id: string): void;
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
    SEPA: string;
    BLIK: string;
    TRUSTLY: string;
    VERKKOPANKKI: string;
    VENMO: string;
}

export interface PaypalCommerceSDK {
    FUNDING: PaypalCommerceSDKFunding;
    HostedFields: {
        isEligible(): boolean;
        render(data: PaypalCommerceHostedFieldsRenderOptions): Promise<PaypalCommerceHostedFields>;
    };
    Buttons(params: ButtonsOptions): PaypalCommerceButtons;
    PaymentFields(params: FieldsOptions): PaypalCommerceFields;
    Messages(params: MessagesOptions): PaypalCommerceMessages;
}

export interface PaypalCommerceHostWindow extends Window {
    paypal?: PaypalCommerceSDK;
    paypalLoadScript?(options: PaypalCommerceScriptParams): Promise<{ paypal: PaypalCommerceSDK }>;
}

export type FundingType = string[];
export type EnableFundingType =  FundingType | string;

export interface PaypalCommerceInitializationData {
    clientId: string;
    merchantId?: string;
    buyerCountry?: string;
    isDeveloperModeApplicable?: boolean;
    intent?: 'capture' | 'authorize';
    isPayPalCreditAvailable?: boolean;
    availableAlternativePaymentMethods: FundingType;
    enabledAlternativePaymentMethods: FundingType;
    isProgressiveOnboardingAvailable?: boolean;
    clientToken?: string;
    attributionId?: string;
}

export type ComponentsScriptType = Array<'buttons' | 'messages' | 'hosted-fields' | 'fields'>;

export interface PaypalCommerceScriptParams  {
    'client-id': string;
    'merchant-id'?: string;
    'buyer-country'?: string;
    'disable-funding'?: FundingType;
    'enable-funding'?: EnableFundingType;
    'data-client-token'?: string;
    'data-partner-attribution-id'?: string;
    currency?: string;
    commit?: boolean;
    intent?: 'capture' | 'authorize';
    components?: ComponentsScriptType;
}

export interface UnitedStatesCodes {
    name: string;
    abbreviation: string;
}

export const UNITED_STATES_CODES = [
    {
        name: 'Alabama',
        abbreviation: 'AL',
    },
    {
        name: 'Alaska',
        abbreviation: 'AK',
    },
    {
        name: 'American Samoa',
        abbreviation: 'AS',
    },
    {
        name: 'Arizona',
        abbreviation: 'AZ',
    },
    {
        name: 'Arkansas',
        abbreviation: 'AR',
    },
    {
        name: 'California',
        abbreviation: 'CA',
    },
    {
        name: 'Colorado',
        abbreviation: 'CO',
    },
    {
        name: 'Connecticut',
        abbreviation: 'CT',
    },
    {
        name: 'Delaware',
        abbreviation: 'DE',
    },
    {
        name: 'District Of Columbia',
        abbreviation: 'DC',
    },
    {
        name: 'Federated States Of Micronesia',
        abbreviation: 'FM',
    },
    {
        name: 'Florida',
        abbreviation: 'FL',
    },
    {
        name: 'Georgia',
        abbreviation: 'GA',
    },
    {
        name: 'Guam',
        abbreviation: 'GU',
    },
    {
        name: 'Hawaii',
        abbreviation: 'HI',
    },
    {
        name: 'Idaho',
        abbreviation: 'ID',
    },
    {
        name: 'Illinois',
        abbreviation: 'IL',
    },
    {
        name: 'Indiana',
        abbreviation: 'IN',
    },
    {
        name: 'Iowa',
        abbreviation: 'IA',
    },
    {
        name: 'Kansas',
        abbreviation: 'KS',
    },
    {
        name: 'Kentucky',
        abbreviation: 'KY',
    },
    {
        name: 'Louisiana',
        abbreviation: 'LA',
    },
    {
        name: 'Maine',
        abbreviation: 'ME',
    },
    {
        name: 'Marshall Islands',
        abbreviation: 'MH',
    },
    {
        name: 'Maryland',
        abbreviation: 'MD',
    },
    {
        name: 'Massachusetts',
        abbreviation: 'MA',
    },
    {
        name: 'Michigan',
        abbreviation: 'MI',
    },
    {
        name: 'Minnesota',
        abbreviation: 'MN',
    },
    {
        name: 'Mississippi',
        abbreviation: 'MS',
    },
    {
        name: 'Missouri',
        abbreviation: 'MO',
    },
    {
        name: 'Montana',
        abbreviation: 'MT',
    },
    {
        name: 'Nebraska',
        abbreviation: 'NE',
    },
    {
        name: 'Nevada',
        abbreviation: 'NV',
    },
    {
        name: 'New Hampshire',
        abbreviation: 'NH',
    },
    {
        name: 'New Jersey',
        abbreviation: 'NJ',
    },
    {
        name: 'New Mexico',
        abbreviation: 'NM',
    },
    {
        name: 'New York',
        abbreviation: 'NY',
    },
    {
        name: 'North Carolina',
        abbreviation: 'NC',
    },
    {
        name: 'North Dakota',
        abbreviation: 'ND',
    },
    {
        name: 'Northern Mariana Islands',
        abbreviation: 'MP',
    },
    {
        name: 'Ohio',
        abbreviation: 'OH',
    },
    {
        name: 'Oklahoma',
        abbreviation: 'OK',
    },
    {
        name: 'Oregon',
        abbreviation: 'OR',
    },
    {
        name: 'Palau',
        abbreviation: 'PW',
    },
    {
        name: 'Pennsylvania',
        abbreviation: 'PA',
    },
    {
        name: 'Puerto Rico',
        abbreviation: 'PR',
    },
    {
        name: 'Rhode Island',
        abbreviation: 'RI',
    },
    {
        name: 'South Carolina',
        abbreviation: 'SC',
    },
    {
        name: 'South Dakota',
        abbreviation: 'SD',
    },
    {
        name: 'Tennessee',
        abbreviation: 'TN',
    },
    {
        name: 'Texas',
        abbreviation: 'TX',
    },
    {
        name: 'Utah',
        abbreviation: 'UT',
    },
    {
        name: 'Vermont',
        abbreviation: 'VT',
    },
    {
        name: 'Virgin Islands',
        abbreviation: 'VI',
    },
    {
        name: 'Virginia',
        abbreviation: 'VA',
    },
    {
        name: 'Washington',
        abbreviation: 'WA',
    },
    {
        name: 'West Virginia',
        abbreviation: 'WV',
    },
    {
        name: 'Wisconsin',
        abbreviation: 'WI',
    },
    {
        name: 'Wyoming',
        abbreviation: 'WY',
    },
];
