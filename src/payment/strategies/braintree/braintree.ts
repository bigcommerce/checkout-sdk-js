export interface SDK {
    client?: ClientCreator;
    dataCollector?: DataCollectorCreator;
    paypal?: PaypalCreator;
    threeDSecure?: ThreeDSecureCreator;
}

export interface ModuleCreator<T> {
    create(config: ModuleCreatorConfig): Promise<T>;
}

export interface ModuleCreatorConfig {
    client?: Client;
    authorization?: string;
    kount?: boolean;
}

export interface ClientCreator extends ModuleCreator<Client> {}
export interface DataCollectorCreator extends ModuleCreator<DataCollector> {}
export interface ThreeDSecureCreator extends ModuleCreator<ThreeDSecure> {}
export interface PaypalCreator extends ModuleCreator<Paypal> {}

export interface Module {
    teardown(): Promise<void>;
}

export interface Client {
    request(payload: RequestData): Promise<TokenizeResponse>;
    getVersion(): string | void;
}

export interface ThreeDSecure extends Module {
    verifyCard(options: ThreeDSecureOptions): Promise<{ nonce: string }>;
    cancelVerifyCard(): Promise<VerifyPayload>;
}

export interface ThreeDSecureOptions {
    nonce: string;
    amount: number;
    showLoader?: boolean;
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement): void;
    removeFrame(): void;
}

export interface DataCollector extends Module {
    deviceData?: string;
}

export interface Paypal {
    closeWindow(): void;
    focusWindow(): void;
    tokenize(options: PaypalRequest): Promise<TokenizePayload>;
}

export interface TokenizeReturn {
    close(): void;
    focus(): void;
}

export interface HostWindow extends Window {
    braintree?: SDK;
}

export interface TokenizeResponse {
    creditCards: Array<{ nonce: string }>;
}

export interface RequestData {
    data: {
        creditCard: {
            billingAddress: {
                countryName: string;
                postalCode: string;
                streetAddress: string;
            }
            cardholderName: string;
            cvv?: string;
            expirationDate: string;
            number: string;
            options: {
                validate: boolean;
            }
        },
    };
    endpoint: string;
    method: string;
}

export interface PaypalRequest {
    amount: string | number;
    billingAgreementDescription?: string;
    currency?: string;
    displayName?: string;
    enableShippingAddress: true;
    flow: 'checkout' | 'vault';
    intent?: 'authorize' | 'order' | 'sale';
    landingPageType?: 'login' | 'billing';
    locale?: string;
    offerCredit: boolean;
    shippingAddressEditable?: boolean;
    shippingAddressOverride?: Address;
    useraction?: 'commit';
}

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
    recipientName?: string;
}

export interface TokenizePayload {
    nonce: string;
    type: 'PaypalAccount';
    details: {
        email: string;
        payerId: string;
        fistName: string;
        lastName: string;
        countryCode?: string;
        phone?: string;
        shippingAddress?: Address;
        billingAddress?: Address;
    };
    creditFinancingOffered: {
        totalCost: {
            value: string;
            currency: string;
        };
        term: number;
        monthlyPayment: {
            value: string;
            currency: string;
        };
        totalInsterest: {
            value: string;
            currency: string;
        };
        payerAcceptance: boolean;
        cartAmountImmutable: boolean;
    };
}

export interface VerifyPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    liabilityShiftPossible: boolean;
    liabilityShifted: boolean;
}
