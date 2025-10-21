/* eslint-disable @typescript-eslint/naming-convention */
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export const THREE_D_SECURE_PROCEED = 'PROCEED';
export const THREE_D_SECURE_BUSY = 'SERVER_BUSY';
export const THREE_D_SECURE_AVAILABLE = 'AUTHENTICATION_AVAILABLE';

export interface CBAMPGSHostWindow extends Window {
    ThreeDS?: ThreeDSjs;
}

export interface ThreeDSjs {
    // Configuration method for initializing the API.
    configure(config: ThreeDSConfiguration): Promise<void>;
    // Convenience method to check if the API has been configured successfully.
    isConfigured(): boolean;
    // Authentication for the arguments passed.
    initiateAuthentication(
        orderId: string,
        transactionId: string,
        callback: (data: ThreeDSAuthenticationResponse) => void,
    ): void;
    authenticatePayer(
        orderId: string,
        transactionId: string,
        callback: (data: ThreeDSAuthenticationResponse) => void,
        optionalParams?: AuthenticatePayerOptionalParams,
    ): void;
}

export interface RestApiResponse {
    transaction: {
        authenticationStatus: string;
    };
}

// Configuration required to configure ThreeDS
export interface ThreeDSConfiguration {
    merchantId: string;
    sessionId: string;
    configuration: ThreeDSAPIConfiguration;
    callback(): void;
}

export interface ThreeDSAuthenticationResponse {
    error?: ThreeDSAuthenticationError;
    restApiResponse: RestApiResponse;
    gatewayRecommendation: string;
}

export interface AuthenticatePayerOptionalParams {
    fullScreenRedirect: boolean;
}

export interface ThreeDSAuthenticationError {
    code: string;
    msg: string;
    cause?: string;
}

// JSON value supporting data elements like userLanguage, REST API version (wsVersion)
export interface ThreeDSAPIConfiguration {
    // A language identifier or IETF language tag to control the language of the payment page displayed to the payer.
    //  For example, "en_US", es, "fr-CA". By default, the language is "en_US".
    userLanguage: string;
    // The Web Services API version that you submitted the request in. IE: 62
    wsVersion: number;
}

export interface CBAMPGSPaymentMethod extends PaymentMethod {
    initializationData: CBAMPGSInitializationData;
}

export interface CBAMPGSInitializationData {
    isTestModeFlagEnabled?: boolean;
    merchantId: string;
}

export interface ThreeDSErrorBody {
    three_ds_result: {
        token: string;
    };
}
