import { AmazonPayAddressBookConstructor } from './amazon-pay-address-book';
import AmazonPayConfirmationFlow from './amazon-pay-confirmation-flow';
import AmazonPayLogin from './amazon-pay-login';
import { AmazonPayLoginButtonConstructor } from './amazon-pay-login-button';
import { AmazonPayWalletConstructor } from './amazon-pay-wallet';

export default interface AmazonPayWindow extends Window {
    amazon?: {
        Login: AmazonPayLogin;
    };
    OffAmazonPayments?: OffAmazonPayments;
    onAmazonLoginReady?(): void;
    onAmazonPaymentsReady?(): void;
}

export interface OffAmazonPayments {
    Button: AmazonPayLoginButtonConstructor;
    Widgets: {
        AddressBook: AmazonPayAddressBookConstructor;
        Wallet: AmazonPayWalletConstructor;
    };
    initConfirmationFlow(sellerId: string, id: string, callback: (confirmationFlow: AmazonPayConfirmationFlow) => void): void;
}
