/* eslint-disable @typescript-eslint/naming-convention */
import { includes } from 'lodash';

import {
    Address,
    BillingAddress,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentMethodCancelledError,
    PaymentMethodInvalidError,
    PaymentRequestOptions,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import KlarnaPayments, {
    KlarnaAddress,
    KlarnaAuthorizationResponse,
    KlarnaLoadResponse,
    KlarnaUpdateSessionParams,
} from './klarna-payments';
import {
    supportedCountries,
    supportedCountriesRequiringStates,
} from './klarna-supported-countries';
import { WithKlarnaV2PaymentInitializeOptions } from './klarnav2-payment-initialize-options';
import KlarnaV2ScriptLoader from './klarnav2-script-loader';
import KlarnaV2TokenUpdater from './klarnav2-token-updater';

export default class KlarnaV2PaymentStrategy {
    private klarnaPayments?: KlarnaPayments;
    private unsubscribe?: () => void;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private klarnav2ScriptLoader: KlarnaV2ScriptLoader,
        private klarnav2TokenUpdater: KlarnaV2TokenUpdater,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithKlarnaV2PaymentInitializeOptions,
    ): Promise<void> {
        this.klarnaPayments = await this.klarnav2ScriptLoader.load();

        this.unsubscribe = this.paymentIntegrationService.subscribe(
            (state) => {
                if (
                    state.isPaymentMethodInitialized({
                        methodId: options.methodId,
                        gatewayId: options.gatewayId,
                    })
                ) {
                    void this.loadPaymentsWidget(options);
                }
            },
            (state) => {
                const checkout = state.getCheckout();

                return checkout && checkout.outstandingBalance;
            },
            (state) => {
                const checkout = state.getCheckout();

                return checkout && checkout.coupons;
            },
        );

        await this.loadPaymentsWidget(options);
    }

    deinitialize(): Promise<void> {
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        if (!payload.payment) {
            throw new InvalidArgumentError(
                'Unable to proceed because "payload.payment" argument is not provided.',
            );
        }

        const {
            payment: { ...paymentPayload },
        } = payload;
        const { gatewayId, methodId } = paymentPayload;

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "payload.payment.gatewayId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const { id: cartId } = state.getCartOrThrow();
        const { clientToken } = state.getPaymentMethodOrThrow(methodId);

        await this.klarnav2TokenUpdater.klarnaOrderInitialization(cartId, clientToken);

        const paymentMethodСategory = this.isKlarnaSingleRadioButtonEnabled()
            ? gatewayId
            : methodId;
        const { authorization_token: authorizationToken } = await this.authorizeOrThrow(
            paymentMethodСategory,
        );

        await this.paymentIntegrationService.initializePayment(gatewayId, {
            authorizationToken,
        });

        await this.paymentIntegrationService.submitOrder(
            {
                ...payload,
                payment: paymentPayload,
                useStoreCredit: payload.useStoreCredit,
            },
            options,
        );
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private async loadPaymentsWidget(
        options: PaymentInitializeOptions & WithKlarnaV2PaymentInitializeOptions,
    ): Promise<KlarnaLoadResponse> {
        if (!options.klarnav2) {
            throw new InvalidArgumentError(
                'Unable to load widget because "options.klarnav2" argument is not provided.',
            );
        }

        const {
            methodId,
            gatewayId,
            klarnav2: { container, onLoad },
        } = options;

        if (!gatewayId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "payload.payment.gatewayId" argument is not provided.',
            );
        }

        const state = this.paymentIntegrationService.getState();
        const cartId = state.getCartOrThrow().id;
        const params = { params: cartId };

        await this.klarnav2TokenUpdater.updateClientToken(gatewayId, { params }).catch(() => {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        });

        return new Promise<KlarnaLoadResponse>((resolve) => {
            const paymentMethod = state.getPaymentMethodOrThrow(methodId);

            if (!this.klarnaPayments || !paymentMethod.clientToken) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this.klarnaPayments.init({ client_token: paymentMethod.clientToken });
            this.klarnaPayments.load(
                {
                    container,
                    payment_method_category: this.isKlarnaSingleRadioButtonEnabled()
                        ? paymentMethod.gateway
                        : methodId,
                },
                (response) => {
                    if (onLoad) {
                        onLoad(response);
                    }

                    resolve(response);
                },
            );
        });
    }

    private getUpdateSessionData(
        billingAddress: BillingAddress,
        shippingAddress?: Address,
    ): KlarnaUpdateSessionParams {
        if (
            !includes(
                [...supportedCountries, ...supportedCountriesRequiringStates],
                billingAddress.countryCode,
            )
        ) {
            return {};
        }

        const data: KlarnaUpdateSessionParams = {
            billing_address: this.mapToKlarnaAddress(billingAddress, billingAddress.email),
        };

        if (shippingAddress) {
            data.shipping_address = this.mapToKlarnaAddress(shippingAddress, billingAddress.email);
        }

        return data;
    }

    private needsStateCode(countryCode: string) {
        return includes(supportedCountriesRequiringStates, countryCode);
    }

    private mapToKlarnaAddress(address: Address, email?: string): KlarnaAddress {
        const klarnaAddress: KlarnaAddress = {
            street_address: address.address1,
            city: address.city,
            country: address.countryCode,
            given_name: address.firstName,
            family_name: address.lastName,
            postal_code: address.postalCode,
            region: this.needsStateCode(address.countryCode)
                ? address.stateOrProvinceCode
                : address.stateOrProvince,
            email,
        };

        if (address.address2) {
            klarnaAddress.street_address2 = address.address2;
        }

        if (address.phone) {
            klarnaAddress.phone = address.phone;
        }

        return klarnaAddress;
    }

    private async authorizeOrThrow(
        paymentMethodСategory: string,
    ): Promise<KlarnaAuthorizationResponse> {
        await this.paymentIntegrationService.loadCheckout();

        const state = this.paymentIntegrationService.getState();
        const billingAddress = state.getBillingAddressOrThrow();
        const shippingAddress = state.getShippingAddress();

        const updateSessionData = this.getUpdateSessionData(billingAddress, shippingAddress);

        return new Promise<KlarnaAuthorizationResponse>((resolve, reject) => {
            if (!this.klarnaPayments) {
                return reject(
                    new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized),
                );
            }

            this.klarnaPayments.authorize(
                {
                    payment_method_category: paymentMethodСategory,
                },
                updateSessionData,
                (res) => {
                    if (res.approved) {
                        return resolve(res);
                    }

                    if (res.show_form) {
                        return reject(new PaymentMethodCancelledError());
                    }

                    reject(new PaymentMethodInvalidError());
                },
            );
        });
    }

    private isKlarnaSingleRadioButtonEnabled(): boolean {
        const { features } = this.paymentIntegrationService
            .getState()
            .getStoreConfigOrThrow().checkoutSettings;

        return features['PI-4025.klarna_single_radio_button'];
    }
}
