/// <reference path="../../remote-checkout/methods/amazon-pay/amazon-login.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />

import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { CheckoutSelectors } from '../../checkout';
import { NotInitializedError, NotImplementedError } from '../../common/error/errors';
import { PaymentMethod } from '../../payment';
import { ReadableDataStore } from '../../../data-store';
import { RemoteCheckoutRequestSender } from '../../remote-checkout';
import CustomerCredentials from '../customer-credentials';
import CustomerStrategy from './customer-strategy';
import SignInCustomerService from '../sign-in-customer-service';

export default class AmazonPayCustomerStrategy extends CustomerStrategy {
    private _paymentMethod: PaymentMethod | undefined;
    private _signInButton: OffAmazonPayments.Button | undefined;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        signInCustomerService: SignInCustomerService,
        private _requestSender: RemoteCheckoutRequestSender,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store, signInCustomerService);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        this._paymentMethod = options.paymentMethod;

        (window as any).onAmazonPaymentsReady = () => {
            this._signInButton = this._createSignInButton(options);
        };

        return this._scriptLoader.loadWidget(this._paymentMethod)
            .then(() => super.initialize(options));
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._signInButton = undefined;
        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    signIn(credentials: CustomerCredentials, options?: any): Promise<CheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via AmazonPay, the shopper must click on "Login with Amazon" button.'
        );
    }

    signOut(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            throw new NotInitializedError();
        }

        return this._signInCustomerService.remoteSignOut(this._paymentMethod!.id, options);
    }

    private _createSignInButton(options: InitializeWidgetOptions): OffAmazonPayments.Button {
        const { config, initializationData } = this._paymentMethod!;

        return new OffAmazonPayments.Button(options.container, config.merchantId!, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            authorization: () => this._authorizeClient(initializationData),
        });
    }

    private _authorizeClient(options: AuthorizationOptions): Promise<void> {
        return this._requestSender.generateToken()
            .then(({ body }) => {
                amazon.Login.authorize({
                    popup: false,
                    scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                    state: `${options.tokenPrefix}${body.token}`,
                }, options.redirectUrl);

                this._requestSender.trackAuthorizationEvent();
            });
    }
}

export interface InitializeOptions extends InitializeWidgetOptions {
    paymentMethod: PaymentMethod;
}

interface InitializeWidgetOptions {
    container: string;
    color?: string;
    size?: string;
    onError?: (error: Error) => void;
}

interface AuthorizationOptions {
    redirectUrl: string;
    tokenPrefix: string;
}
