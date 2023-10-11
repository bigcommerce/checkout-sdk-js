import { some } from 'lodash';

import {
    BraintreeIntegrationService,
    isBraintreeAcceleratedCheckoutCustomer,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { Address } from '../../../address';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import { isHostedInstrumentLike, PaymentMethod } from '../../index';
import isVaultedInstrument from '../../is-vaulted-instrument';
import { PaymentInstrument, PaymentInstrumentMeta } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';

export default class BraintreeCreditCardPaymentStrategy implements PaymentStrategy {
    private _is3dsEnabled?: boolean;
    private _isHostedFormInitialized?: boolean;
    private _deviceSessionId?: string;
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
        private _braintreeIntegrationService: BraintreeIntegrationService,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, gatewayId, braintree } = options;

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(methodId),
        );

        const storeConfig = state.config.getStoreConfigOrThrow();

        this._paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        const { clientToken } = this._paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this._braintreePaymentProcessor.initialize(clientToken, storeConfig, braintree);

            if (this._isHostedPaymentFormEnabled(methodId, gatewayId) && braintree?.form) {
                await this._braintreePaymentProcessor.initializeHostedForm(braintree.form);
                this._isHostedFormInitialized =
                    this._braintreePaymentProcessor.isInitializedHostedForm();
            }

            this._is3dsEnabled = this._paymentMethod.config.is3dsEnabled;
            this._deviceSessionId = await this._braintreePaymentProcessor.getSessionId();

            // TODO: remove this part when BT AXO A/B testing will be finished
            if (this._shouldInitializeBraintreeConnect()) {
                await this._initializeBraintreeConnectOrThrow(methodId);
            }
        } catch (error) {
            this._handleError(error);
        }

        //
        return this._store.getState();
    }

    async execute(
        orderRequest: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        if (this._isHostedFormInitialized) {
            this._braintreePaymentProcessor.validateHostedForm();
        }

        const {
            billingAddress: { getBillingAddressOrThrow },
            order: { getOrderOrThrow },
        } = await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const billingAddress = getBillingAddressOrThrow();
        const orderAmount = getOrderOrThrow().orderAmount;

        try {
            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: this._isHostedFormInitialized
                        ? await this._prepareHostedPaymentData(payment, billingAddress, orderAmount)
                        : await this._preparePaymentData(payment, billingAddress, orderAmount),
                }),
            );
        } catch (error) {
            return this._processAdditionalAction(error, payment, orderAmount);
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        this._isHostedFormInitialized = false;

        await Promise.all([
            this._braintreePaymentProcessor.deinitialize(),
            this._braintreePaymentProcessor.deinitializeHostedForm(),
        ]);

        return this._store.getState();
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new PaymentMethodFailedError(error.message);
        }

        throw error;
    }

    private async _preparePaymentData(
        payment: OrderPaymentRequestBody,
        billingAddress: Address,
        orderAmount: number,
    ): Promise<PaymentInstrument & PaymentInstrumentMeta> {
        const { paymentData } = payment;
        const commonPaymentData = { deviceSessionId: this._deviceSessionId };

        if (this._isSubmittingWithStoredCard(payment)) {
            return {
                ...commonPaymentData,
                ...paymentData,
            };
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { nonce } = this._shouldPerform3DSVerification(payment)
            ? await this._braintreePaymentProcessor.verifyCard(payment, billingAddress, orderAmount)
            : await this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress);

        return {
            ...commonPaymentData,
            nonce,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
        };
    }

    private async _prepareHostedPaymentData(
        payment: OrderPaymentRequestBody,
        billingAddress: Address,
        orderAmount: number,
    ): Promise<PaymentInstrument & PaymentInstrumentMeta> {
        const { paymentData } = payment;
        const commonPaymentData = { deviceSessionId: this._deviceSessionId };

        if (this._isSubmittingWithStoredCard(payment)) {
            const { nonce } =
                await this._braintreePaymentProcessor.tokenizeHostedFormForStoredCardVerification();

            return {
                ...commonPaymentData,
                ...paymentData,
                nonce,
            };
        }

        const { shouldSaveInstrument = false, shouldSetAsDefaultInstrument = false } =
            isHostedInstrumentLike(paymentData) ? paymentData : {};

        const { nonce } = this._shouldPerform3DSVerification(payment)
            ? await this._braintreePaymentProcessor.verifyCardWithHostedForm(
                  billingAddress,
                  orderAmount,
              )
            : await this._braintreePaymentProcessor.tokenizeHostedForm(billingAddress);

        return {
            ...commonPaymentData,
            shouldSaveInstrument,
            shouldSetAsDefaultInstrument,
            nonce,
        };
    }

    private async _processAdditionalAction(
        error: Error,
        payment: OrderPaymentRequestBody,
        orderAmount: number,
    ): Promise<InternalCheckoutSelectors> {
        if (
            !(error instanceof RequestError) ||
            !some(error.body.errors, { code: 'three_d_secure_required' })
        ) {
            return this._handleError(error);
        }

        try {
            const {
                instruments: { getCardInstrumentOrThrow },
            } = this._store.getState();
            const { payer_auth_request: storedCreditCardNonce } = error.body.three_ds_result || {};
            const { paymentData } = payment;

            if (!paymentData || !isVaultedInstrument(paymentData)) {
                throw new PaymentArgumentInvalidError(['instrumentId']);
            }

            const instrument = getCardInstrumentOrThrow(paymentData.instrumentId);
            const { nonce } = await this._braintreePaymentProcessor.challenge3DSVerification(
                {
                    nonce: storedCreditCardNonce,
                    bin: instrument.iin,
                },
                orderAmount,
            );

            return await this._store.dispatch(
                this._paymentActionCreator.submitPayment({
                    ...payment,
                    paymentData: {
                        deviceSessionId: this._deviceSessionId,
                        nonce,
                    },
                }),
            );
        } catch (error) {
            return this._handleError(error);
        }
    }

    private _isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean {
        if (!methodId) {
            return false;
        }

        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private _isSubmittingWithStoredCard(payment: OrderPaymentRequestBody): boolean {
        return !!(payment.paymentData && isVaultedInstrument(payment.paymentData));
    }

    private _shouldPerform3DSVerification(payment: OrderPaymentRequestBody): boolean {
        return !!(this._is3dsEnabled && !this._isSubmittingWithStoredCard(payment));
    }

    // TODO: remove this part when BT AXO A/B testing will be finished
    private _shouldInitializeBraintreeConnect() {
        const state = this._store.getState();
        const paymentProviderCustomer = state.paymentProviderCustomer.getPaymentProviderCustomer();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};
        const isAcceleratedCheckoutEnabled =
            this._paymentMethod?.initializationData.isAcceleratedCheckoutEnabled;

        return (
            isAcceleratedCheckoutEnabled && !braintreePaymentProviderCustomer?.authenticationState
        );
    }

    // TODO: remove this part when BT AXO A/B testing will be finished
    private async _initializeBraintreeConnectOrThrow(methodId: string): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const storeConfig = state.config.getStoreConfigOrThrow();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, config } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeIntegrationService.initialize(clientToken, storeConfig);

        await this._braintreeIntegrationService.getBraintreeConnect(cart.id, config.testMode);
    }
}
