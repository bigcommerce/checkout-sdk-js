export default interface AmazonPayLogin {
    authorize(options: AmazonPayLoginOptions, redirectUrl: string): void;
    setClientId(clientId: string): void;
    setUseCookie(useCookie: boolean): void;
}

export interface AmazonPayLoginOptions {
    popup: boolean;
    scope: string;
    state: string;
}
