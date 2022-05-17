import AmazonPayWidgetError from './amazon-pay-widget-error';

// tslint:disable-next-line:no-empty-interface
export default interface AmazonPayLoginButton {}

export type AmazonPayLoginButtonConstructor = new(container: string, merchantId: string, options: AmazonPayLoginButtonOptions) => AmazonPayLoginButton;

export interface AmazonPayLoginButtonOptions {
    type: string;
    color: string;
    size: string;
    useAmazonAddressBook: boolean;
    authorization?(): void;
    onError?(error: AmazonPayWidgetError): void;
}
