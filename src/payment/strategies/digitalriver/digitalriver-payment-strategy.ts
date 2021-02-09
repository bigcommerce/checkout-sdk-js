import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import DigitalRiverJS, { DigitalRiverDropIn, DigitalRiverInitializeToken, OnCancelOrErrorResponse, OnReadyResponse, OnSuccessResponse } from './digitalriver';
import DigitalRiverPaymentInitializeOptions from './digitalriver-payment-initialize-options';
import DigitalRiverScriptLoader from './digitalriver-script-loader';

export default class DigitalRiverPaymentStrategy implements PaymentStrategy {
    private _digitalRiverJS?: DigitalRiverJS;
    private _digitalRiverDropComponent?: DigitalRiverDropIn;
    private _submitFormEvent?: () => void;
    private _loadSuccessResponse?: OnSuccessResponse;
    private _digitalRiverCheckoutId?: string;
    private _digitalRiverInitializeOptions?: DigitalRiverPaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _digitalRiverScriptLoader: DigitalRiverScriptLoader
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._digitalRiverInitializeOptions = options.digitalriver;

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId));
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);
        let clientToken: DigitalRiverInitializeToken;

        if (!paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        clientToken = JSON.parse(paymentMethod.clientToken);

        const billing = state.billingAddress.getBillingAddressOrThrow();
        const customer = state.customer.getCustomerOrThrow();
        this._digitalRiverCheckoutId = clientToken.checkoutId;
        this._submitFormEvent = this._getDigitalRiverInitializeOptions().onSubmitForm;

        const configuration = {
            sessionId: clientToken.sessionId,
            options: { ...this._getDigitalRiverInitializeOptions().configuration },
            billingAddress: {
                firstName: billing.firstName,
                lastName: billing.lastName,
                email: billing.email || customer.email,
                phoneNumber: billing.phone,
                address: {
                    line1: billing.address1,
                    line2: billing.address2,
                    city: billing.city,
                    state: billing.stateOrProvinceCode,
                    postalCode: billing.postalCode,
                    country: billing.countryCode,
                },
            },
            onSuccess: (data?: OnSuccessResponse) => {
                this._onSuccessResponse(data);
            },
            onReady: (data?: OnReadyResponse) => {
                this._onReadyResponse(data);
            },
            onError: (error: OnCancelOrErrorResponse) => {
                this._getDigitalRiverInitializeOptions().onError?.(new Error(this._getErrorMessage(error)));
            },
        };

        this._digitalRiverJS = await this._digitalRiverScriptLoader.load(paymentMethod.initializationData.publicKey, paymentMethod.initializationData.paymentLanguage);
        this._digitalRiverDropComponent = await this._getDigitalRiverJs().createDropin( configuration );
        await this._digitalRiverDropComponent.mount(this._getDigitalRiverInitializeOptions().containerId);

        return state;
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        if (!payment || !this._loadSuccessResponse || !this._digitalRiverCheckoutId) {
            throw new InvalidArgumentError('Unable to proceed because payload payment argument is not provided.');
        }

        return Promise.resolve(this._store.getState());
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _getDigitalRiverJs(): DigitalRiverJS {
        if (!this._digitalRiverJS) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._digitalRiverJS;
    }

    private _getErrorMessage(error: OnCancelOrErrorResponse): string {
        const { errors } = error;

        return errors.map(e => 'code: ' + e.code + ' message: ' + e.message).join('\n');
    }

    private _onSuccessResponse(data?: OnSuccessResponse): Promise<void> {
        const error = new InvalidArgumentError('Unable to initialize payment because success argument is not provided.');

        return new Promise((resolve, reject) => {
            if (data && this._submitFormEvent) {
                const { browserInfo } = data.source;
                this._loadSuccessResponse = browserInfo ? {
                    source: {
                        id: data.source.id,
                        reusable: data.source.reusable,
                        ...browserInfo,
                    },
                    readyForStorage: data.readyForStorage,
                } : {
                    source: {
                        id: data.source.id,
                        reusable: data.source.reusable,
                    },
                    readyForStorage: data.readyForStorage,
                };
                resolve();
                this._submitFormEvent();
            } else {
                reject(error);
                this._getDigitalRiverInitializeOptions().onError?.(error);
            }
        });
    }

    private _onReadyResponse(data?: OnReadyResponse): void {
        if (data) {
            this._getDigitalRiverInitializeOptions().onRenderButton?.();
        }
    }

    private _getDigitalRiverInitializeOptions(): DigitalRiverPaymentInitializeOptions {
        if (!this._digitalRiverInitializeOptions) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._digitalRiverInitializeOptions;
    }
}
