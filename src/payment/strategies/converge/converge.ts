export interface ConvergeSDK {
    web3dsFlow(request: ConvergeRequestParams): Promise<ConvergeResponseData>;
}

export interface ConvergeHostWindow extends Window {
    Elavon3DSWebSDK?: new (options: ConvergeOptions) => ConvergeSDK;
}

export interface ConvergeOptions {
    baseUrl: string;
    token?: string;
}

export enum ConvergeMessageCategory {
    PaymentAuthentication = '01',
}

export enum ConvergePurchaseExponent {
    USD = '2',
}

export enum ConvergeTransactionType {
    Purchase = '01',
}

export enum Converge3DSRequestorAuthenticationIndicator {
    PaymentTransaction = '01',
}

export interface ConvergeRequestParams {
    messageId: string;
    purchaseAmount: string;
    purchaseCurrency: string;
    purchaseExponent: ConvergePurchaseExponent;
    acctNumber: string;
    cardExpiryDate: string;
    messageCategory: ConvergeMessageCategory;
    transType: ConvergeTransactionType;
    threeDSRequestorAuthenticationInd: Converge3DSRequestorAuthenticationIndicator;
}

export interface ConvergeRequestData {
    messageId: string;
    purchaseAmount: string;
    acctNumber: string;
    cardExpiryDate: string;
    purchaseCurrency: string;
}

export interface ConvergeResponseData {
    acsChallengeMandated: string;
    acsOperatorID: string;
    acsReferenceNumber: string;
    acsTransID: string;
    acsURL: string;
    authenticated: boolean;
    authenticationType: string;
    authenticationValue: string;
    dsReferenceNumber: string;
    dsTransID: string;
    eci: string;
    interactionCounter: string;
    message: string;
    messageCategory: string;
    messageId: string;
    messageType: string;
    messageVersion: string;
    threeDSServerTransID: string;
    transStatus: string;
}
