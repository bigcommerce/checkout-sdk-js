import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { getBrowserInfo } from '../../../common/browser-info';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodCancelledError } from '../../errors';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment, { HostedInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import isCardState, { isAccountState, AdyenAction, AdyenActionType, AdyenAdditionalAction, AdyenAdditionalActionState, AdyenApplePayComponent, AdyenClient, AdyenComponent, AdyenComponentState, AdyenComponentType, AdyenError, AdyenPaymentMethodType } from './adyenv2';
import AdyenV2PaymentInitializeOptions from './adyenv2-initialize-options';
import AdyenV2ScriptLoader from './adyenv2-script-loader';
import { CurrencyExponent } from './applepay';

export default class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _adyenClient?: AdyenClient;
    private _cardVerificationComponent?: AdyenComponent;
    private _componentState?: AdyenComponentState;
    private _paymentComponent?: AdyenComponent;
    private _paymentInitializeOptions?: AdyenV2PaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _scriptLoader: AdyenV2ScriptLoader,
        private _locale: string
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { adyenv2 } = options;

        if (!adyenv2) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.adyenv2" argument is not provided.');
        }

        this._paymentInitializeOptions = adyenv2;

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._adyenClient = await this._scriptLoader.load({
            environment:  paymentMethod.initializationData.environment,
            locale: this._locale,
            originKey: paymentMethod.initializationData.originKey,
            paymentMethodsResponse: paymentMethod.initializationData.paymentMethodsResponse,
        });

        this._mountPaymentComponent(paymentMethod)
            .then(paymentComponent => this._paymentComponent = paymentComponent)
            .catch(error => Promise.reject(error));

        if (paymentMethod.method === AdyenPaymentMethodType.CreditCard ||
            paymentMethod.method === AdyenPaymentMethodType.Bancontact) {
            this._mountCardVerificationComponent()
                .then(cardVerificationComponent => this._cardVerificationComponent = cardVerificationComponent);
        }

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;
        const shouldSaveInstrument = paymentData && (paymentData as HostedInstrument).shouldSaveInstrument;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => {
                const componentState = this._componentState;

                if (!componentState) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                if (paymentData && isVaultedInstrument(paymentData)) {
                    let bigpayToken = {};
                    if (isCardState(componentState)) {
                        const { encryptedCardNumber, encryptedSecurityCode, encryptedExpiryMonth, encryptedExpiryYear } = componentState.data.paymentMethod;

                        bigpayToken = {
                            credit_card_number_confirmation: encryptedCardNumber,
                            expiry_month: encryptedExpiryMonth,
                            expiry_year: encryptedExpiryYear,
                            verification_value: encryptedSecurityCode,
                        };
                    }

                    if (isCardState(componentState) || isAccountState(componentState)) {
                        return this._store.dispatch(this._paymentActionCreator.submitPayment({
                            ...payment,
                            paymentData: {
                                formattedPayload: {
                                    bigpay_token: {
                                        ...bigpayToken,
                                        token: paymentData.instrumentId,
                                    },
                                    browser_info: getBrowserInfo(),
                                },
                            },
                        }));
                    }
                }

                return this._store.dispatch(this._paymentActionCreator.submitPayment({
                    methodId: payment.methodId,
                    paymentData: {
                        formattedPayload: {
                            credit_card_token: {
                                token: JSON.stringify({
                                    ...componentState.data.paymentMethod,
                                    origin: window.location.origin,
                                }),
                            },
                            browser_info: getBrowserInfo(),
                            vault_payment_instrument: shouldSaveInstrument,
                        },
                    },
                }));

                // handle `Apple Pay` payment
            })
            .catch(error => this._processAdditionalAction(error, shouldSaveInstrument));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._paymentComponent) {
            this._paymentComponent.unmount();
            this._paymentComponent = undefined;
        }

        if (this._cardVerificationComponent) {
            this._cardVerificationComponent.unmount();
            this._cardVerificationComponent = undefined;
        }

        return Promise.resolve(this._store.getState());
    }

    private _getAdyenClient(): AdyenClient {
        if (!this._adyenClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._adyenClient;
    }

    private _getPaymentInitializeOptions(): AdyenV2PaymentInitializeOptions {
        if (!this._paymentInitializeOptions) {
            throw new InvalidArgumentError('"options.adyenv2" argument was not provided during initialization.');
        }

        return this._paymentInitializeOptions;
    }

    private _getThreeDS2ChallengeWidgetSize(): string {
        const { widgetSize } = this._getPaymentInitializeOptions().threeDS2Options;

        if (!widgetSize) {
            return '05';
        }

        return widgetSize;
    }

    private _handleAction(additionalAction: AdyenAdditionalAction): Promise<Payment> {
        return new Promise((resolve, reject) => {
            const { threeDS2ContainerId, additionalActionOptions } = this._getPaymentInitializeOptions();
            const { onBeforeLoad, containerId, onLoad, onComplete } = additionalActionOptions;
            const adyenAction: AdyenAction = JSON.parse(additionalAction.action);

            const additionalActionComponent = this._getAdyenClient().createFromAction(adyenAction, {
                onAdditionalDetails: (additionalActionState: AdyenAdditionalActionState) => {
                    const paymentPayload = {
                        methodId: adyenAction.paymentMethodType,
                        paymentData: {
                            nonce: JSON.stringify(additionalActionState.data),
                        },
                    };

                    if (onComplete) {
                        onComplete();
                    }

                    resolve(paymentPayload);
                },
                size: this._getThreeDS2ChallengeWidgetSize(),
                onError: (error: AdyenError) => reject(error),
            });

            if (onBeforeLoad) {
                onBeforeLoad(adyenAction.type === AdyenActionType.ThreeDS2Challenge ||
                    adyenAction.type === AdyenActionType.QRCode);
            }

            additionalActionComponent.mount(`#${containerId || threeDS2ContainerId}`);

            if (onLoad) {
                onLoad(() => {
                    reject(new PaymentMethodCancelledError());
                    additionalActionComponent.unmount();
                });
            }
        });
    }

    private _mountCardVerificationComponent(): Promise<AdyenComponent> {
        const adyenv2 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();
        let cardVerificationComponent: AdyenComponent;

        return new Promise(resolve => {
            if (adyenv2.cardVerificationContainerId) {
                cardVerificationComponent = adyenClient.create(AdyenComponentType.SecuredFields, {
                    ...adyenv2.options,
                    onChange: componentState => this._updateComponentState(componentState),
                    onError: componentState => this._updateComponentState(componentState),
                });

                cardVerificationComponent.mount(`#${adyenv2.cardVerificationContainerId}`);
            }

            resolve(cardVerificationComponent);
        });
    }

    private _getInMinorUnits(amount: number, currencyCode: keyof CurrencyExponent) {
        const codes: CurrencyExponent = {
            IDR: 1, JPY: 1, KRW: 1, VND: 1, BYR: 1, CVE: 1, DJF: 1, GHC: 1, GNF: 1, KMF: 1, PYG: 1, RWF: 1, UGX: 1,
            VUV: 1, XAF: 1, XOF: 1, XPF: 1, MRO: 10, BHD: 1e3, JOD: 1e3, KWD: 1e3, OMR: 1e3, LYD: 1e3, TND: 1e3,
        };

        return amount * (codes[currencyCode] || 100);
    }

    private _mountPaymentComponent(paymentMethod: PaymentMethod): Promise<AdyenComponent> {
        let paymentComponent: AdyenComponent;
        const adyenv2 = this._getPaymentInitializeOptions();
        const adyenClient = this._getAdyenClient();
        const checkout = this._store.getState().checkout.getCheckout();

        return new Promise(resolve => {
            switch (paymentMethod.method) {
                case AdyenPaymentMethodType.CreditCard:
                case AdyenPaymentMethodType.ACH:
                case AdyenPaymentMethodType.Bancontact:
                case AdyenPaymentMethodType.GiroPay:
                case AdyenPaymentMethodType.iDEAL:
                case AdyenPaymentMethodType.SEPA:
                    paymentComponent = adyenClient.create(paymentMethod.method, {
                            ...adyenv2.options,
                            onChange: componentState => this._updateComponentState(componentState),
                        }
                    );

                    paymentComponent.mount(`#${adyenv2.containerId}`);
                    break;

                case AdyenPaymentMethodType.AliPay:
                case AdyenPaymentMethodType.Sofort:
                case AdyenPaymentMethodType.Vipps:
                case AdyenPaymentMethodType.WeChatPayQR:
                    this._updateComponentState({
                        data: {
                            paymentMethod: {
                                type: paymentMethod.method,
                            },
                        },
                    });
                    break;

                case AdyenPaymentMethodType.ApplePay:
                    if (!checkout) {
                        throw new MissingDataError(MissingDataErrorType.MissingCheckout);
                    }

                    const currencyCode = checkout.cart.currency.code;

                    const {
                        initializationData: {
                            storeCountry: countryCode,
                            appleMerchantName: merchantName,
                            appleMerchantId: merchantIdentifier,
                        },
                    } = paymentMethod;

                    const applepay = adyenClient
                        .create(paymentMethod.method, {
                            currencyCode,
                            amount: this._getInMinorUnits(checkout.outstandingBalance, currencyCode),
                            countryCode,
                            configuration: {
                                merchantName,
                                merchantIdentifier,
                            },
                            onValidateMerchant: (_resolve, _reject, _validationURL) => {
                                // ...
                            },
                            onChange: this._updateComponentState,
                        }) as AdyenApplePayComponent;

                    applepay
                        .isAvailable()
                        .then(() => {
                            applepay.mount(`#${adyenv2.containerId}`);
                            paymentComponent = applepay;
                        })
                        .catch((_e: Error) => {
                            // Apple Pay is not available
                        });
                    break;
            }

            resolve(paymentComponent);
        });
    }

    private async _processAdditionalAction(error: unknown, shouldSaveInstrument?: boolean): Promise<InternalCheckoutSelectors> {
        if (!(error instanceof RequestError) || !some(error.body.errors, {code: 'additional_action_required'})) {
            return Promise.reject(error);
        }

        const payment = await this._handleAction(error.body.provider_data);

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                ...payment,
                paymentData: {
                    ...payment.paymentData,
                    shouldSaveInstrument,
                },
            }));
        } catch (error) {
            return this._processAdditionalAction(error, shouldSaveInstrument);
        }
    }

    private _updateComponentState(componentState: AdyenComponentState) {
        this._componentState = componentState;
    }
}
