import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { AmazonMaxoPaymentProcessor, AmazonMaxoPlacement } from '../../../payment/strategies/amazon-maxo';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class AmazonMaxoCustomerStrategy implements CustomerStrategy {
    private _methodId?: string;
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _amazonMaxoPaymentProcessor: AmazonMaxoPaymentProcessor
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, amazonmaxo } = options;

        if (!amazonmaxo) {
            throw new InvalidArgumentError('Unable to proceed because "options.amazonmaxo" argument is not provided.');
        }

        if (!methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._methodId = methodId;

        return this._amazonMaxoPaymentProcessor.initialize(methodId)
            .then(() => { this._walletButton = this._createSignInButton(amazonmaxo.container);
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Amazon, the shopper must click on "Amazon Maxo" button.'
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options)
        );
    }

    private _createSignInButton(containerId: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        if (!this._methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const state = this._store.getState();
        const paymentMethod =  state.paymentMethods.getPaymentMethod(this._methodId);

        const config = state.config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            config: {
                merchantId,
                testMode,
            },
            initializationData: {
                checkoutLanguage,
                ledgerCurrency,
                checkoutSessionMethod,
                region,
                extractAmazonCheckoutSessionId,
            },
        } = paymentMethod;

        if (!merchantId) {
            throw new InvalidArgumentError();
        }

        const amazonButtonOptions = {
            merchantId,
            sandbox: !!testMode,
            checkoutLanguage,
            ledgerCurrency,
            region,
            productType: 'PayAndShip',
            createCheckoutSession: {
                method: checkoutSessionMethod,
                url: `${config.links.siteLink}/remote-checkout-token/${this._methodId}`,
                extractAmazonCheckoutSessionId,
            },
            placement: AmazonMaxoPlacement.Checkout,
        };

        return this._amazonMaxoPaymentProcessor.createButton(`#${containerId}`, amazonButtonOptions);
    }
}
