import { TokenizedCreditCard } from '../../payment';

declare namespace Braintree {
    interface SDK {
        client?: ClientCreator;
        dataCollector?: DataCollectorCreator;
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
}
