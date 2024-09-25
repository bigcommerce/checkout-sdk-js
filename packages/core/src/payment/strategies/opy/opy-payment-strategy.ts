import { StorefrontPaymentRequestSender } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    MissingDataError,
    MissingDataErrorType,
    NotImplementedError,
    RequestError,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { ActionTypes, isOpyPaymentMethod } from './opy';
import { OpyWidgetConfig } from './opy-library';
import OpyError, { OpyErrorType } from './opy-payment-error';
import OpyScriptLoader from './opy-script-loader';

export default class OpyPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storefrontPaymentRequestSender: StorefrontPaymentRequestSender,
        private _paymentActionCreator: PaymentActionCreator,
        private _scriptLoader: OpyScriptLoader,
    ) {}

    async initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (options?.opy?.containerId) {
            const {
                methodId,
                opy: { containerId },
            } = options;

            const paymentMethod = this._store.getState().paymentMethods.getPaymentMethod(methodId);

            if (paymentMethod && isOpyPaymentMethod(paymentMethod)) {
                const {
                    initializationData: { widgetConfig },
                } = paymentMethod;

                await this._installWidget(containerId, widgetConfig);
            }
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { methodId } = payment;
        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId, options),
        );
        const paymentMethod = getPaymentMethodOrThrow(methodId);

        if (!isOpyPaymentMethod(paymentMethod)) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            clientToken: nonce,
            initializationData: { nextAction },
        } = paymentMethod;

        if (!nextAction) {
            const { displayName = 'Openpay' } = paymentMethod.config;

            throw new OpyError(OpyErrorType.InvalidCart, displayName);
        }

        if (!nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        await this._storefrontPaymentRequestSender.saveExternalId(methodId, nonce);

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment({ methodId, paymentData: { nonce } }),
            );
        } catch (error) {
            if (
                error instanceof RequestError &&
                error.body.status === 'additional_action_required'
            ) {
                if (nextAction.type === ActionTypes.FORM_POST) {
                    const { formPostUrl, formFields } = nextAction.formPost;

                    const url = new URL(formPostUrl.replace(/\/$/, ''));

                    formFields.forEach(({ fieldName, fieldValue }) => {
                        url.searchParams.append(fieldName, fieldValue);
                    });

                    return new Promise(() => window.location.assign(decodeURI(url.href)));
                }

                throw new NotImplementedError(`Unsupported action type: ${nextAction.type}`);
            }

            throw error;
        }
    }

    finalize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private async _installWidget(containerId: string, config: OpyWidgetConfig): Promise<void> {
        const widgetContainer = document.getElementById(containerId);

        if (widgetContainer) {
            try {
                const widget = await this._scriptLoader.loadOpyWidget(config.region);

                widget.Config(config);
            } catch (error) {
                return;
            }

            widgetContainer.appendChild(document.createElement('opy-learn-more-button'));
        }
    }
}
