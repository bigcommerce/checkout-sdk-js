import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import isCreditCardLike from '../../is-credit-card-like';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import { CreditCardPaymentStrategy } from '../credit-card';

import { Converge3DSRequestorAuthenticationIndicator, ConvergeMessageCategory, ConvergePurchaseExponent, ConvergeRequestParams, ConvergeResponseData, ConvergeSDK, ConvergeTransactionType } from './converge';
import ConvergeScriptLoader from './converge-script-loader';

export default class ConvergePaymentStrategy extends CreditCardPaymentStrategy {
    private _convergeSDK?: ConvergeSDK;

    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        hostedFormFactory: HostedFormFactory,
        private _formPoster: FormPoster,
        private _convergeScriptLoader: ConvergeScriptLoader,
        private _paymentMethodActionCreator: PaymentMethodActionCreator
    ) {
        super(store, orderActionCreator, paymentActionCreator, hostedFormFactory);
    }

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;
        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId);

        const is3dsV2 = paymentMethod.initializationData.is3dsV2Enabled;

        if (is3dsV2) {
            const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId));
            const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

            if (!paymentMethod || !paymentMethod.clientToken) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            this._convergeSDK = await this._loadConvergeJs(paymentMethod.clientToken);

            return this._store.getState();
        } else {
            return Promise.resolve(this._store.getState());
        }
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment || !payment.paymentData || !isCreditCardLike(payment.paymentData)) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData: { ccNumber, ccExpiry, ccCvv, ccName } } = payment;

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);

        const is3dsV2 = paymentMethod.initializationData.is3dsV2Enabled;

        if (is3dsV2) {
            const { threeDSServerTransID, dsTransID, transStatus, authenticated } = await this.request3DSWebSDK(payload);

            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

            try {
                return await this._store.dispatch(this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: {
                        formattedPayload: {
                            authenticated,
                            threeDSServerTransID,
                            dsTransID,
                            transStatus,
                            credit_card: {
                                account_name: ccName,
                                month: ccExpiry.month,
                                number: ccNumber,
                                verification_value: ccCvv,
                                year: ccExpiry.year,
                            },
                        },
                    },
                }));
            } catch (error) {
                if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                    throw error;
                }

                return new Promise(() => {
                    this._formPoster.postForm(error.body.three_ds_result.acs_url, {
                        PaReq: error.body.three_ds_result.payer_auth_request,
                        TermUrl: error.body.three_ds_result.callback_url,
                        MD: error.body.three_ds_result.merchant_data,
                    });
                });
            }
        } else {
            try {
                return await super.execute(payload, options);
            } catch (error) {
                if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                    throw error;
                }

                return new Promise(() => {
                    this._formPoster.postForm(error.body.three_ds_result.acs_url, {
                        PaReq: error.body.three_ds_result.payer_auth_request,
                        TermUrl: error.body.three_ds_result.callback_url,
                        MD: error.body.three_ds_result.merchant_data,
                    });
                });
            }
        }
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (order && state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    request3DSWebSDK(payload: OrderRequestBody): Promise <ConvergeResponseData> {
        const requestParams = this._getRequestParams(payload);

        return this._getConvergeSDK().web3dsFlow(requestParams);
    }

    private async _loadConvergeJs(clientToken: string): Promise <ConvergeSDK> {
        if (this._convergeSDK) { return Promise.resolve(this._convergeSDK); }

        return await this._convergeScriptLoader.load(clientToken);
    }

    private _getConvergeSDK(): ConvergeSDK {
        if (!this._convergeSDK) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._convergeSDK;
    }

    private _getRequestParams(payload: OrderRequestBody): ConvergeRequestParams {
        const { payment } = payload;
        const checkout = this._store.getState().checkout.getCheckoutOrThrow();

        if (!payment || !payment.paymentData || !isCreditCardLike(payment.paymentData)) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData: { ccExpiry: { year, month }, ccNumber: acctNumber } } = payment;
        const cardExpiryDate = year.substr(-2) + month;

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(payment.methodId);

        const { currencyCode, messageId } = paymentMethod.initializationData;

        const purchaseAmount = Math.trunc(checkout.grandTotal * 100).toString();

        return {
            messageId,
            cardExpiryDate,
            purchaseCurrency: currencyCode,
            acctNumber,
            purchaseAmount,
            purchaseExponent: ConvergePurchaseExponent.USD,
            messageCategory: ConvergeMessageCategory.PaymentAuthentication,
            transType: ConvergeTransactionType.Purchase,
            threeDSRequestorAuthenticationInd: Converge3DSRequestorAuthenticationIndicator.PaymentTransaction,
        };
    }
}
