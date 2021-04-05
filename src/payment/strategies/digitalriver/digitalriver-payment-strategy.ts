import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentMethodClientUnavailableError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import DigitalRiverJS, { DigitalRiverDropIn, DigitalRiverInitializeToken, DigitalRiverInstance, DigitalRiverWindow, OnCancelOrErrorResponse, OnReadyResponse, OnSuccessResponse } from './digitalriver';
import DigitalRiverPaymentInitializeOptions from './digitalriver-payment-initialize-options';
import DigitalRiverScriptLoader from './digitalriver-script-loader';

export default class DigitalRiverPaymentStrategy implements PaymentStrategy {
    private _digitalRiverJS?: DigitalRiverJS;
    private _digitalRiverInstance?: DigitalRiverInstance;
    private _digitalRiverDropComponent?: DigitalRiverDropIn;
    private _submitFormEvent?: () => void;
    private _loadSuccessResponse?: OnSuccessResponse;
    private _digitalRiverCheckoutData?: DigitalRiverInitializeToken;
    private _unsubscribe?: (() => void);
    private _digitalRiverInitializeOptions?: DigitalRiverPaymentInitializeOptions;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _digitalRiverScriptLoader: DigitalRiverScriptLoader
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        this._digitalRiverInitializeOptions = options.digitalriver;
        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(options.methodId);
        const { publicKey, paymentLanguage: locale } = paymentMethod.initializationData;
        const digitalRiverWindow: DigitalRiverWindow = await this._digitalRiverScriptLoader.load();
        const { containerId } = this._getDigitalRiverInitializeOptions();

        this._digitalRiverInstance = digitalRiverWindow.DigitalRiver;

        if (!this._digitalRiverInstance) {
            throw new PaymentMethodClientUnavailableError();
        }

        this._digitalRiverJS = new this._digitalRiverInstance(publicKey, { locale });

        this._unsubscribe = await this._store.subscribe(
            state => {
                if (state.paymentStrategies.isInitialized(options.methodId)) {
                    const container = document.getElementById(containerId);

                    if (container) {
                        container.innerHTML = '';

                        if (!this._digitalRiverInstance) {
                            throw new PaymentMethodClientUnavailableError();
                        }

                        this._digitalRiverJS = new this._digitalRiverInstance(publicKey, { locale });
                    }

                    this._loadWidget(options);
                }
            },
            state => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            state => {
                const checkout = state.checkout.getCheckout();

                return checkout && checkout.coupons;
            }
        );

        return this._loadWidget(options);
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._unsubscribe) {
            this._unsubscribe();
        }

        return Promise.resolve(this._store.getState());
    }

    async execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;
        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        if (!payment || !this._loadSuccessResponse || !this._digitalRiverCheckoutData) {
            throw new InvalidArgumentError('Unable to proceed because payload payment argument is not provided.');
        }

        const paymentPayload = {
            methodId: payment.methodId,
            paymentData: {
                nonce: JSON.stringify({
                    checkoutId: this._digitalRiverCheckoutData.checkoutId,
                    source: this._loadSuccessResponse,
                    sessionId: this._digitalRiverCheckoutData.sessionId,
                }),
            },
        };

        return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
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

    private async _loadWidget(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId));
        const billing = state.billingAddress.getBillingAddressOrThrow();
        const customer = state.customer.getCustomerOrThrow();
        const {paymentMethodConfiguration} = this._getDigitalRiverInitializeOptions().configuration;
        const { containerId, configuration } = this._getDigitalRiverInitializeOptions();
        const { clientToken } = state.paymentMethods.getPaymentMethodOrThrow(options.methodId);

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._digitalRiverCheckoutData = JSON.parse(clientToken);

        if (!this._digitalRiverCheckoutData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._submitFormEvent = this._getDigitalRiverInitializeOptions().onSubmitForm;
        const digitalRiverConfiguration = {
            sessionId: this._digitalRiverCheckoutData.sessionId,
            options: { ...configuration },
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
            paymentMethodConfiguration,
            onSuccess: (data?: OnSuccessResponse) => {
                this._onSuccessResponse(data);
            },
            onReady: (data?: OnReadyResponse) => {
                this._onReadyResponse(data);
            },
            onError: (error: OnCancelOrErrorResponse) => {
                const descriptiveError = new Error(this._getErrorMessage(error));
                this._getDigitalRiverInitializeOptions().onError?.(descriptiveError);
            },
        };
        this._digitalRiverDropComponent = await this._getDigitalRiverJs().createDropin(digitalRiverConfiguration);
        this._digitalRiverDropComponent.mount(containerId);

        return state;
    }
}
