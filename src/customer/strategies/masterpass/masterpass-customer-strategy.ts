import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { getCallbackUrl, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class MasterpassCustomerStrategy implements CustomerStrategy {
    private _signInButton?: HTMLElement;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader,
        private _locale: string
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { masterpass: masterpassOptions, methodId } = options;

        if (!masterpassOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.masterpass" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {

                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                if (!this._paymentMethod || !this._paymentMethod.initializationData.checkoutId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                const cart = state.cart.getCart();
                const locale = this.formatLocale(this._locale);

                if (!cart) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                const { container } = masterpassOptions;

                const payload = {
                    checkoutId: this._paymentMethod.initializationData.checkoutId,
                    allowedCardTypes: this._paymentMethod.initializationData.allowedCardTypes,
                    amount: cart.cartAmount.toString(),
                    currency: cart.currency.code,
                    cartId: cart.id,
                    suppressShippingAddress: false,
                    callbackUrl: getCallbackUrl('checkout'),
                };

                const masterpassScriptLoaderParams = {
                    useMasterpassSrc: this._paymentMethod.initializationData.isMasterpassSrcEnabled,
                    language: locale,
                    testMode: this._paymentMethod.config.testMode,
                    checkoutId: this._paymentMethod.initializationData.checkoutId,
                };

                return this._masterpassScriptLoader.load(masterpassScriptLoaderParams)
                    .then(Masterpass => {
                        this._signInButton = this._createSignInButton(container);

                        this._signInButton.addEventListener('click', () => {
                            Masterpass.checkout(payload);
                        });
                    });
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        if (this._signInButton && this._signInButton.parentNode) {
            this._signInButton.parentNode.removeChild(this._signInButton);
            this._signInButton = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Masterpass, the shopper must click on "Masterpass" button.'
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

        if (!this._paymentMethod || !this._paymentMethod.initializationData.checkoutId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const button = document.createElement('input');

        button.type = 'image';

        if (this._paymentMethod.initializationData.isMasterpassSrcEnabled) {
            const subdomain = this._paymentMethod.config.testMode ? 'sandbox.' : '';
            const { checkoutId } = this._paymentMethod.initializationData;
            const locale = this.formatLocale(this._locale);

            const params = [
                `locale=${locale}`,
                `paymentmethod=master,visa,amex,discover`,
                `checkoutid=${checkoutId}`,
            ];

            button.src = [
                `https://${subdomain}src.mastercard.com/assets/img/btn/src_chk_btn_126x030px.svg`,
                params.join('&'),
            ].join('?');
        } else {
            button.src = 'https://static.masterpass.com/dyn/img/btn/global/mp_chk_btn_160x037px.svg';
        }
        container.appendChild(button);

        return button;
    }

    private formatLocale( localeLanguage: string): string {
        const supportedLocales: {[language: string]: string[]} = {es: ['es_es', 'es_mx', 'es_pe', 'es_co', 'es_ar', 'es_cl'],
            en: ['en_us', 'en_gb', 'en_ca', 'en_es', 'en_fr', 'en_ie', 'en_sg', 'en_au', 'en_nz', 'en_my', 'en_hk', 'en_th', 'en_ae', 'en_sa', 'en_qa', 'en_kw', 'en_za'],
            pt: ['pt_br'],
            zu: ['zu_za'],
            ar: ['ar_sa', 'ar_ae', 'ar_qa', 'ar_kw'],
            zh: ['zh_sg', 'zh_hk'],
            ms: ['ms_my'],
            uk: ['uk_ua'],
            sv: ['sv_se'],
            hr: ['hr_hr'],
            pl: ['pl_pl'],
            nl: ['nl_be'],
            it: ['it_it'],
            de: ['de_de'],
            fr: ['fr_fr', 'fr_ca']};
        let formatedLocale = localeLanguage.replace('-', '_').toLowerCase();
        const regexLocale = formatedLocale.match(/^([a-z]{2})((?:\_)([a-z]{2}))?$/);
        if (regexLocale && regexLocale[3]) {
            if (regexLocale[1] in supportedLocales) {
                formatedLocale = supportedLocales[regexLocale[1]].indexOf(regexLocale[0]) !== -1 ? formatedLocale : supportedLocales[regexLocale[1]][0];
            } else {
                formatedLocale = 'en_us';
            }
        } else if (regexLocale) {
            formatedLocale = regexLocale[1] in supportedLocales ? supportedLocales[regexLocale[1]][0] : 'en_us';
        } else {
            formatedLocale = 'en_us';
        }

        return formatedLocale;
    }
}
