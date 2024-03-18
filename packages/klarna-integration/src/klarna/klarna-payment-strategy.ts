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

import {
    supportedCountries,
    supportedCountriesRequiringStates,
} from '../klarnav2/klarna-supported-countries';

import KlarnaCredit, {
    KlarnaAddress,
    KlarnaAuthorizationResponse,
    KlarnaLoadResponse,
    KlarnaUpdateSessionParams,
} from './klarna-credit';
import { WithKlarnaPaymentInitializeOptions } from './klarna-payment-initialize-options';
import KlarnaScriptLoader from './klarna-script-loader';

export default class KlarnaPaymentStrategy {
    private klarnaCredit?: KlarnaCredit;
    private unsubscribe?: () => void;

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private klarnaScriptLoader: KlarnaScriptLoader,
    ) {}

    async initialize(
        options: PaymentInitializeOptions & WithKlarnaPaymentInitializeOptions,
    ): Promise<void> {
        this.klarnaCredit = await this.klarnaScriptLoader.load();

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.unsubscribe = this.paymentIntegrationService.subscribe(
            (state) => {
                if (
                    state.isPaymentMethodInitialized({
                        methodId: options.methodId,
                        gatewayId: options.gatewayId,
                    })
                ) {
                    void this.loadWidget(options);
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

        await this.loadWidget(options);
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
            payment: { paymentData, ...paymentPayload },
        } = payload;

        const { authorization_token: authorizationToken } = await this.authorize();

        await this.paymentIntegrationService.initializePayment(paymentPayload.methodId, {
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

    private async loadWidget(
        options: PaymentInitializeOptions & WithKlarnaPaymentInitializeOptions,
    ): Promise<KlarnaLoadResponse> {
        if (!options.klarna) {
            throw new InvalidArgumentError(
                'Unable to load widget because "options.klarna" argument is not provided.',
            );
        }

        const {
            methodId,
            klarna: { container, onLoad },
        } = options;

        await this.paymentIntegrationService.loadPaymentMethod(methodId);

        return new Promise<KlarnaLoadResponse>((resolve) => {
            const paymentMethod = this.paymentIntegrationService
                .getState()
                .getPaymentMethod(methodId);

            if (!paymentMethod) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            if (!this.klarnaCredit || !paymentMethod.clientToken) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            this.klarnaCredit.init({ client_token: paymentMethod.clientToken });

            this.klarnaCredit.load({ container }, (response) => {
                if (onLoad) {
                    onLoad(response);
                }

                resolve(response);
            });
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

    private authorize(): Promise<KlarnaAuthorizationResponse> {
        return new Promise((resolve, reject) => {
            const state = this.paymentIntegrationService.getState();
            const billingAddress = state.getBillingAddress();
            const shippingAddress = state.getShippingAddress();

            if (!billingAddress) {
                throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
            }

            if (!this.klarnaCredit) {
                throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
            }

            const updateSessionData = this.getUpdateSessionData(billingAddress, shippingAddress);

            this.klarnaCredit.authorize(updateSessionData, (res) => {
                if (res.approved) {
                    return resolve(res);
                }

                if (res.show_form) {
                    return reject(new PaymentMethodCancelledError());
                }

                reject(new PaymentMethodInvalidError());
            });
        });
    }
}
