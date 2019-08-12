import { RequestSender } from '@bigcommerce/request-sender';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

import { CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentMethodCancelledError } from '../../errors';
import Payment from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import PaymentStrategy from '../payment-strategy';
import { WepayRiskClient } from '../wepay';

import { ChasePay, ChasePayEventType, ChasePaySuccessPayload } from './chasepay';
import ChasePayInitializeOptions from './chasepay-initialize-options';
import ChasePayScriptLoader from './chasepay-script-loader';

export default class ChasePayPaymentStrategy implements PaymentStrategy {
    private _chasePayClient?: ChasePay;
    private _methodId!: string;
    private _walletButton?: HTMLElement;
    private _walletEvent$: Subject<{ type: ChasePayEventType }>;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _requestSender: RequestSender,
        private _chasePayScriptLoader: ChasePayScriptLoader,
        private _wepayRiskClient: WepayRiskClient
    ) {
        this._walletEvent$ = new Subject();
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._methodId = options.methodId;

        if (!options.chasepay) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.chasepay" argument is not provided.');
        }

        const walletButton = options.chasepay.walletButton && document.getElementById(options.chasepay.walletButton);

        if (walletButton) {
            this._walletButton = walletButton;
            this._walletButton.addEventListener('click', this._handleWalletButtonClick);
        }

        return this._configureWallet(options.chasepay)
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton) {
            this._walletButton.removeEventListener('click', this._handleWalletButtonClick);
        }

        this._walletButton = undefined;
        this._chasePayClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._getPayment()
            .catch(error => {
                if (error.subtype === MissingDataErrorType.MissingPayment) {
                    return this._displayWallet()
                        .then(() => this._getPayment());
                }

                throw error;
            })
            .then(payment =>
                this._createOrder(payment, payload.useStoreCredit, options)
            );
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _configureWallet(options: ChasePayInitializeOptions): Promise<void> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);
        const storeConfig = state.config.getStoreConfig();

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!storeConfig) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        return this._chasePayScriptLoader.load(paymentMethod.config.testMode)
            .then(({ ChasePay }) => {
                this._chasePayClient = ChasePay;

                if (options.logoContainer && document.getElementById(options.logoContainer)) {
                    this._chasePayClient.insertBrandings({
                        color: 'white',
                        containers: [options.logoContainer],
                    });
                }

                this._chasePayClient.configure({
                    language: storeConfig.storeProfile.storeLanguage,
                });

                this._chasePayClient.on(ChasePayEventType.CancelCheckout, () => {
                    this._walletEvent$.next({ type: ChasePayEventType.CancelCheckout });

                    if (options.onCancel) {
                        options.onCancel();
                    }
                });

                this._chasePayClient.on(ChasePayEventType.CompleteCheckout, (payload: ChasePaySuccessPayload) => {
                    this._setSessionToken(payload.sessionToken)
                        .then(() => {
                            this._walletEvent$.next({ type: ChasePayEventType.CompleteCheckout });

                            if (options.onPaymentSelect) {
                                options.onPaymentSelect();
                            }
                        });
                });
            });
    }

    private _displayWallet(): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._paymentStrategyActionCreator.widgetInteraction(() => {
            this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
                .then(state => {
                    const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);

                    if (!this._chasePayClient) {
                        throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                    }

                    if (!paymentMethod) {
                        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                    }

                    this._chasePayClient.showLoadingAnimation();
                    this._chasePayClient.startCheckout(paymentMethod.initializationData.digitalSessionId);
                });

            // Wait for payment selection
            return new Promise((resolve, reject) => {
                this._walletEvent$
                    .pipe(take(1))
                    .subscribe((event: { type: ChasePayEventType }) => {
                        if (event.type === ChasePayEventType.CancelCheckout) {
                            reject(new PaymentMethodCancelledError());
                        } else if (event.type === ChasePayEventType.CompleteCheckout) {
                            resolve();
                        }
                    });
            });
        }, { methodId: this._methodId }), { queueId: 'widgetInteraction' });
    }

    private _setSessionToken(sessionToken: string): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);
        const merchantRequestId = paymentMethod && paymentMethod.initializationData.merchantRequestId;

        return this._requestSender.post('checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: {
                action: 'set_external_checkout',
                provider: this._methodId,
                sessionToken,
                merchantRequestId,
            },
        })
            // Re-hydrate checkout data
            .then(() => Promise.all([
                this._store.dispatch(this._checkoutActionCreator.loadCurrentCheckout()),
                this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId)),
            ]))
            .then(() => this._store.getState());
    }

    private _getPayment(): Promise<Payment> {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(this._methodId))
            .then(() => {
                if (this._methodId === 'wepay') {
                    return this._wepayRiskClient.initialize()
                        .then(client => client.getRiskToken());
                }

                return '';
            })
            .then(riskToken => {
                const state = this._store.getState();
                const paymentMethod = state.paymentMethods.getPaymentMethod(this._methodId);

                if (!paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!paymentMethod.initializationData.paymentCryptogram) {
                    throw new MissingDataError(MissingDataErrorType.MissingPayment);
                }

                const paymentData = {
                    method: this._methodId,
                    cryptogramId: paymentMethod.initializationData.paymentCryptogram,
                    eci: paymentMethod.initializationData.eci,
                    transactionId: btoa(paymentMethod.initializationData.reqTokenId),
                    ccExpiry: {
                        month: paymentMethod.initializationData.expDate.toString().substr(0, 2),
                        year: paymentMethod.initializationData.expDate.toString().substr(2, 2),
                    },
                    ccNumber: paymentMethod.initializationData.accountNum,
                    accountMask: paymentMethod.initializationData.accountMask,
                    extraData: riskToken ? { riskToken } : undefined,
                };

                return {
                    methodId: this._methodId,
                    paymentData,
                };
            });
    }

    private _createOrder(payment: Payment, useStoreCredit?: boolean, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder({ useStoreCredit }, options))
            .then(() => this._store.dispatch(this._paymentActionCreator.submitPayment(payment)));
    }

    @bind
    private _handleWalletButtonClick(event: Event): void {
        event.preventDefault();

        this._displayWallet();
    }
}
