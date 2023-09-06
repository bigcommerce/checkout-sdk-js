import {
    BraintreeConnectAddress,
    BraintreeConnectVaultedInstrument,
    BraintreeIntegrationService,
} from '@bigcommerce/checkout-sdk/braintree-utils';
import { BrowserStorage } from '@bigcommerce/checkout-sdk/storage';

import { AddressRequestBody } from '../../../address';
import { BillingAddressActionCreator } from '../../../billing';
import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import { CustomerAddress } from '../../../customer';
import { Country } from '../../../geography';
import { PaymentMethodActionCreator } from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import { CardInstrument } from '../../../payment/instrument';
import { UntrustedShippingCardVerificationType } from '../../../payment/instrument/instrument';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

import BraintreeAcceleratedCheckoutInitializeOptions from './braintree-accelerated-checkout-initialize-options';

export default class BraintreeAcceleratedCheckoutShippingStrategy implements ShippingStrategy {
    private _browserStorage: BrowserStorage;

    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator,
        private _braintreeIntegrationService: BraintreeIntegrationService,
    ) {
        this._browserStorage = new BrowserStorage('paypalConnect');
    }

    updateAddress(
        address: AddressRequestBody,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(this._consignmentActionCreator.updateAddress(address, options));
    }

    selectOption(
        optionId: string,
        options?: ShippingRequestOptions,
    ): Promise<InternalCheckoutSelectors> {
        return this._store.dispatch(
            this._consignmentActionCreator.selectShippingOption(optionId, options),
        );
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async initialize(
        options: BraintreeAcceleratedCheckoutInitializeOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { methodId } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        if (!this._shouldRunAuthenticationFlow()) {
            return Promise.resolve(this._store.getState());
        }

        try {
            await this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(methodId),
            );
            await this._runAuthenticationFlowOrThrow(methodId);
        } catch (error) {
            // Info: we should not throw any error here to avoid
            // customer stuck on shipping step due to the payment provider
            // custom flow
        }

        return Promise.resolve(this._store.getState());
    }

    private _shouldRunAuthenticationFlow(): boolean {
        const state = this._store.getState();
        const cartId = state.cart.getCart()?.id;
        const payPalConnectSessionId = this._browserStorage.getItem('sessionId');
        const paymentProviderCustomer = state.paymentProviderCustomer.getPaymentProviderCustomer();

        return !paymentProviderCustomer?.authenticationState && payPalConnectSessionId === cartId;
    }

    private async _runAuthenticationFlowOrThrow(methodId: string): Promise<void> {
        const state = this._store.getState();
        const cart = state.cart.getCartOrThrow();
        const countries = state.countries.getCountries() || [];
        const customer = state.customer.getCustomer();
        const billingAddress = state.billingAddress.getBillingAddress();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, initializationData } = paymentMethod;

        if (!clientToken || !initializationData) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeIntegrationService.initialize(clientToken, initializationData);

        const braintreeConnect = await this._braintreeIntegrationService.getBraintreeConnect(
            cart?.id,
        );

        const customerEmail = customer?.email || billingAddress?.email;

        if (!customerEmail) {
            return;
        }

        const { lookupCustomerByEmail, triggerAuthenticationFlow } = braintreeConnect.identity;

        const { customerContextId } = await lookupCustomerByEmail(customerEmail);

        if (!customerContextId) {
            return;
        }

        const { authenticationState, profileData } = await triggerAuthenticationFlow(
            customerContextId,
        );

        const addresses = this._mapPayPalToBcAddress(profileData.addresses, countries) || [];
        const instruments = this._mapPayPalToBcInstrument(methodId, profileData.cards) || [];

        await this._store.dispatch(
            this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                authenticationState,
                addresses,
                instruments,
            }),
        );

        if (addresses.length > 0) {
            await this._store.dispatch(
                this._billingAddressActionCreator.updateAddress({
                    ...addresses[0],
                    id: String(addresses[0].id),
                }),
            );
        }

        if (addresses.length > 0 && cart.lineItems.physicalItems.length > 0) {
            await this._store.dispatch(this._consignmentActionCreator.updateAddress(addresses[0]));
        }
    }

    private _getCountryNameByCountryCode(countryCode: string, countries: Country[]): string {
        const matchedCountry = countries.find((country) => country.code === countryCode);

        return matchedCountry?.name || '';
    }

    private _mapPayPalToBcAddress(
        addresses: BraintreeConnectAddress[],
        countries: Country[],
    ): CustomerAddress[] | undefined {
        return addresses.map((address) => ({
            id: Number(address.id),
            type: 'paypal-address',
            firstName: address.firstName || '',
            lastName: address.lastName || '',
            company: address.company || '',
            address1: address.streetAddress,
            address2: address.extendedAddress || '',
            city: address.locality,
            stateOrProvince: address.region,
            stateOrProvinceCode: address.region,
            country: this._getCountryNameByCountryCode(address.countryCodeAlpha2, countries),
            countryCode: address.countryCodeAlpha2,
            postalCode: address.postalCode,
            phone: '',
            customFields: [],
        }));
    }

    private _mapPayPalToBcInstrument(
        methodId: string,
        instruments?: BraintreeConnectVaultedInstrument[],
    ): CardInstrument[] | undefined {
        if (!instruments) {
            return;
        }

        return instruments.map((instrument) => {
            const { id, paymentSource } = instrument;
            const { brand, expiry, lastDigits } = paymentSource.card;

            const [expiryYear, expiryMonth] = expiry.split('-');

            return {
                bigpayToken: id,
                brand,
                defaultInstrument: false,
                expiryMonth,
                expiryYear,
                iin: '',
                last4: lastDigits,
                method: methodId,
                provider: methodId,
                trustedShippingAddress: false,
                untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType.CVV,
                type: 'card',
            };
        });
    }
}
