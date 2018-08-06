import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender, Response } from '@bigcommerce/request-sender';

import {
    PaymentActionCreator,
    PaymentInitializeOptions,
    PaymentMethod,
    PaymentMethodActionCreator,
    PaymentRequestOptions,
} from '../..';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { toFormUrlEncoded } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { ChasePayScriptLoader, ChasePaySuccessPayload } from '../../../payment/strategies/chasepay';
import PaymentStrategy from '../payment-strategy';
import WepayRiskClient from '../wepay/wepay-risk-client';

export default class ChasepayPaymentStrategy extends PaymentStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _chasePayScriptLoader: ChasePayScriptLoader,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _requestSender: RequestSender,
        private _formPoster: FormPoster,
        private _wepayRiskClient: WepayRiskClient
    ) {
        super(store);
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, chasepay: chasepayCheckoutOptions } = options;

        if (!chasepayCheckoutOptions ) {
            throw new InvalidArgumentError('Unable to initialize payment because "options.chasepayCheckoutOptions" argument is not provided.');
        }

        const {
            onError = () => {},
            onSuccess = () => {},
            signInButton,
        } = chasepayCheckoutOptions;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                const cart = state.cart.getCart();
                const storeConfig = state.config.getStoreConfig();
                this._wepayRiskClient.initialize();

                if (!cart || !storeConfig || !this._paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                return this._chasePayScriptLoader.load(this._paymentMethod.config.testMode)
                    .then(({ ChasePay }) => {
                        const { COMPLETE_CHECKOUT } = ChasePay.EventType;

                        ChasePay.on(COMPLETE_CHECKOUT, (payload: ChasePaySuccessPayload) => {
                            this._setExternalCheckoutData(payload).then(() => {
                                onSuccess();
                                this._reloadPage();
                            });
                        });
                        if (signInButton) {
                            this._refreshDigitalSessionId(methodId)
                                .then(digitalSessionId => {
                                    ChasePay.configure({
                                        language: storeConfig.storeProfile.storeLanguage,
                                        zIndex: 100001,
                                        sessionWarningTime: 300000,
                                        sessionTimeoutTime: 360000,
                                    });
                                    ChasePay.showLoadingAnimation();
                                    ChasePay.startCheckout(digitalSessionId);
                                }).catch(error => onError(error));
                        }
                    });
          })
          .then(() => super.initialize(options));
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!this._paymentMethod || !this._paymentMethod.initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const paymentInitData = this._paymentMethod.initializationData;

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment, paymentData: {
                        cryptogramId: paymentInitData.paymentCryptogram,
                        eci: paymentInitData.eci,
                        transactionId: btoa(paymentInitData.reqTokenId),
                        ccExpiry: {
                            month: paymentInitData.expDate.toString().substr(0, 2),
                            year: paymentInitData.expDate.toString().substr(2, 2),
                        },
                        ccNumber: paymentInitData.accountNum,
                        accountMask: paymentInitData.accountMask,
                        extraData: { riskToken: this._wepayRiskClient.getRiskToken() },
                    },
                }))
            );
    }

    private _refreshDigitalSessionId(methodId: string): Promise<string | undefined> {
        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                if (!this._paymentMethod) {
                    return;
                }
                return this._paymentMethod.initializationData.digitalSessionId;
            });
    }

    private _reloadPage() {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                fromChasePay: true,
            },
        });
    }

    private _setExternalCheckoutData(payload: ChasePaySuccessPayload): Promise<Response> {
        const url = `checkout.php?provider=chasepay&action=set_external_checkout`;
        const options = {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: toFormUrlEncoded({
                sessionToken: payload.sessionToken,
            }),
        };

        return this._requestSender.post(url, options);
    }
}

export interface ChasePayInitializeOptions {
    container: string;

    /**
     * This is used to indentify if the initialize is called from the
     * sign in button.
     */
    signInButton?: boolean;

    /**
     * A callback that gets called when ChasePay fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onSuccess?(): void;
}
