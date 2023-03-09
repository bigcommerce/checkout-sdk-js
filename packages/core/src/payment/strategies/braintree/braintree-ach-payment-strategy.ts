import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { PaymentArgumentInvalidError } from '../../errors';
import { UsBankAccountInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { BraintreeError, BraintreeUsBankAccount, UsBankAccountSuccessPayload } from './braintree';
import BraintreePaymentProcessor from './braintree-payment-processor';
import isBraintreeError from './is-braintree-error';
import isUsBankAccountInstrumentLike from './is-us-bank-account-instrument-like';

export default class BraintreeAchPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _usBankAccount?: BraintreeUsBankAccount;
    private _mandateText = '';

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor,
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { braintreeach } = options;

        if (!options.methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!braintreeach) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.braintreeach" argument is not provided.`,
            );
        }

        if (!braintreeach?.mandateText) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.braintreeach.mandateText" argument is not provided.',
            );
        }

        this._mandateText = braintreeach?.mandateText;

        const state = await this._store.dispatch(
            this._paymentMethodActionCreator.loadPaymentMethod(options.methodId),
        );

        this._paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        await this._initializeUsBankAccount(this._paymentMethod?.clientToken);

        return Promise.resolve(this._store.getState());
    }

    async execute(
        orderRequest: OrderRequestBody,
        options: PaymentRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const { paymentData } = payment;

        if (!isUsBankAccountInstrumentLike(paymentData)) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        if (!this._usBankAccount) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        try {
            const { nonce, details } = await this._usBankAccount.tokenize({
                bankDetails: this._getBankDetails(paymentData),
                mandateText: this._mandateText,
            });

            const sessionId = await this._braintreePaymentProcessor.getSessionId();

            const paymentPayload = {
                formattedPayload: {
                    vault_payment_instrument: null,
                    set_as_default_stored_instrument: null,
                    device_info: sessionId || null,
                    paypal_account: {
                        token: nonce,
                        email: details?.email || null,
                    },
                },
            };

            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
            await this._store.dispatch(
                this._paymentActionCreator.submitPayment({
                    methodId: payment.methodId,
                    paymentData: paymentPayload,
                }),
            );
        } catch (error) {
            this._handleError(error);
        }

        return Promise.resolve(this._store.getState());
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async deinitialize(): Promise<InternalCheckoutSelectors> {
        this._mandateText = '';
        this._usBankAccount?.teardown();

        return Promise.resolve(this._store.getState());
    }

    private _getBankDetails(paymentData: UsBankAccountInstrument): UsBankAccountSuccessPayload {
        const ownershipType = paymentData.ownershipType.toLowerCase();
        const accountType = paymentData.accountType.toLowerCase();

        return {
            accountNumber: paymentData.accountNumber,
            routingNumber: paymentData.routingNumber,
            ownershipType,
            ...(ownershipType === 'personal'
                ? {
                      firstName: paymentData.firstName,
                      lastName: paymentData.lastName,
                  }
                : {
                      businessName: paymentData.businessName,
                  }),
            accountType,
            billingAddress: {
                streetAddress: paymentData.address1,
                extendedAddress: paymentData.address2,
                locality: paymentData.city,
                region: paymentData.stateOrProvinceCode,
                postalCode: paymentData.postalCode,
            },
        };
    }

    private _handleError(error: BraintreeError | Error): never {
        if (!isBraintreeError(error)) {
            throw error;
        }

        throw new PaymentMethodFailedError(error.message);
    }

    private async _initializeUsBankAccount(clientToken?: string) {
        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this._braintreePaymentProcessor.initialize(clientToken);
            this._usBankAccount = await this._braintreePaymentProcessor.getUsBankAccount();
        } catch (error) {
            this._handleError(error);
        }
    }
}
