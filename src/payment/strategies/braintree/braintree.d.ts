import { TokenizedCreditCard } from '../../payment';

declare namespace Braintree {
    interface SDK {
        client?: ClientCreator;
        dataCollector?: DataCollectorCreator;
        paypal?: PaypalCreator;
        threeDSecure?: ThreeDSecureCreator;
    }

    interface ModuleCreator<T> {
        create: (config: ModuleCreatorConfig) => Promise<T>;
    }

    interface ModuleCreatorConfig {
        client?: Client;
        authorization?: string;
        kount?: boolean;
    }

    interface ClientCreator extends ModuleCreator<Client> {}
    interface DataCollectorCreator extends ModuleCreator<DataCollector> {}
    interface ThreeDSecureCreator extends ModuleCreator<ThreeDSecure> {}
    interface PaypalCreator extends ModuleCreator<Paypal> {}

    interface Module {
        teardown: () => Promise<void>;
    }

    interface Client {
        request: (payload: RequestData) => Promise<TokenizeResponse>;
        getVersion: () => string | void;
    }

    interface ThreeDSecure extends Module {
        verifyCard: (options: ThreeDSecureOptions, callback?: () => void) => Promise<TokenizedCreditCard>;
        cancelVerifyCard: (callback?: () => void) => Promise<void>;
    }

    interface ThreeDSecureOptions {
        nonce: string;
        amount: number;
        addFrame: () => void;
        removeFrame: () => void;
        showLoader?: boolean;
    }

    interface DataCollector extends Module {
        deviceData?: string;
    }

    interface Paypal {
        closeWindow: () => void;
        focusWindow: () => void;
        tokenize: (options: PaypalRequest) => Promise<TokenizePayload>;
    }

    interface TokenizeReturn {
        close: () => void;
        focus: () => void;
    }

    interface HostWindow extends Window {
        braintree?: SDK;
    }

    interface TokenizeResponse {
        creditCards: Array<{ nonce: string }>;
    }

    interface RequestData {
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

    interface PaypalRequest {
        amount: string | number;
        billingAgreementDescription?: string;
        currency?: string;
        displayName?: string;
        enableShippingAddress: true;
        flow: 'checkout' | 'vault';
        intent?: 'authorize' | 'order' | 'sale';
        landingPageType?: 'login' | 'billing';
        locale;
        locale?: string;
        offerCredit: boolean;
        shippingAddressEditable?: boolean;
        shippingAddressOverride?: Address;
        useraction?: 'commit';
    }

    interface Address {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        countryCode: string;
        phone?: string;
        recipientName?: string;
    }

    interface TokenizePayload {
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
}
