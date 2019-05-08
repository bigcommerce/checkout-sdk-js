import { some } from 'lodash';
import { Subject } from 'rxjs/index';
import {take} from 'rxjs/operators';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType,
    RequestError
} from '../../../common/error/errors';
import { OrderActionCreator } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import OrderRequestBody from '../../../order/order-request-body';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {
    CardinalEventResponse,
    CardinalEventType, CardinalInitializationType, CardinalPaymentBrand, CardinalTriggerEvents, CardinalValidatedAction,
    CyberSourceCardinal,
    SetupCompleteData
} from './cybersource';
import CyberSourceScriptLoader from './cybersource-script-loader';

export default class CyberSourcePaymentStrategy implements PaymentStrategy {
    private _Cardinal?: CyberSourceCardinal;
    private _paymentMethod?: PaymentMethod;
    private _cardinalEvent$: Subject<CardinalEventResponse>;
    private _isSetupCompleted = false;
    private _cardinalSessionId?: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _CyberSourceScriptLoader: CyberSourceScriptLoader
    ) {
        this._cardinalEvent$ = new Subject();
    }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod('cybersourcedirect')).then( state => {
            this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

            if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            const clientToken = this._paymentMethod.clientToken;

            return this._CyberSourceScriptLoader.load(this._paymentMethod.config.testMode)
                .then(Cardinal => {
                    this._Cardinal = Cardinal;

                    if (!this._isSetupCompleted) {
                        this._Cardinal.configure({
                            logging: {
                                level: 'on',
                            },
                        });

                        this._Cardinal.on(CardinalEventType.SetupCompleted, (setupCompletedData: SetupCompleteData) => {
                            this._cardinalSessionId = setupCompletedData.sessionId;
                        });

                        this._Cardinal.on(CardinalEventType.Validated, (data, jwt: string) => {
                            if (data.ActionCode) {
                                switch (data.ActionCode) {
                                    case CardinalValidatedAction.SUCCCESS:
                                        this._cardinalEvent$.next({
                                            eventType: CardinalEventType.Validated,
                                            jwt,
                                        });
                                        break;
                                    case CardinalValidatedAction.NOACTION:
                                        // Handle no actionable outcome
                                        break;
                                    case CardinalValidatedAction.FAILURE:
                                        // Handle failed transaction attempt
                                        break;
                                    case CardinalValidatedAction.ERROR:
                                        if (data.ErrorNumber === 1000) {
                                            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                                        }
                                        break;
                                }
                            } else {
                                console.log(data);
                                console.log(jwt);
                            }
                        });

                        this._Cardinal.setup(CardinalInitializationType.Init, {
                            jwt: clientToken,
                        });

                        this._isSetupCompleted = true;
                    }
                });
        }).then(() => this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!this._Cardinal) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._Cardinal.trigger(CardinalTriggerEvents.BIN_PROCCESS, paymentData.ccNumber).then(result => {
            if (result && result.Status) {
                return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
                    .then(() =>
                        this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }))
                    ).catch(error => {
                        if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'enrolled_card' })) {
                            return Promise.reject(error);
                        }

                        if (!this._Cardinal) {
                            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                        }

                        const continueObject = {
                            AcsUrl: error.body.three_ds_result.acs_url,
                            Payload: error.body.three_ds_result.merchant_data,
                        };

                        const partialOrder = {
                            OrderDetails: {
                                TransactionId: error.body.three_ds_result.payer_auth_request,
                            },
                        };

                        this._Cardinal.continue(CardinalPaymentBrand.CCA, continueObject, partialOrder);

                        // If credit card is enrolled in 3DS Cybersource will handle the rest of the flow so
                        return new Promise((resolve, reject) => {
                            this._cardinalEvent$
                                .pipe(take(1))
                                .subscribe((event: CardinalEventResponse) => {
                                    if (event.eventType === CardinalEventType.Validated) {
                                        resolve(event.jwt);
                                    }
                                });
                        }).then(jwt =>
                            this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }))
                        );
                    });
            } else {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }
        }).catch(error => {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
