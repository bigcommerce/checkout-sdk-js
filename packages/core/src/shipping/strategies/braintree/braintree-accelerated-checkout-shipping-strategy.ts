import { isEqual, omit } from 'lodash';

import {
    BraintreeConnectAddress,
    BraintreeConnectPhone,
    BraintreeConnectProfileData,
    BraintreeConnectStylesOption,
    BraintreeConnectVaultedInstrument,
    BraintreeFastlaneAuthenticationState,
    BraintreeIntegrationService,
    isBraintreeAcceleratedCheckoutCustomer,
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

import BraintreeAcceleratedCheckoutShippingInitializeOptions from './braintree-accelerated-checkout-shipping-initialize-options';

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
        options: BraintreeAcceleratedCheckoutShippingInitializeOptions,
    ): Promise<InternalCheckoutSelectors> {
        const { methodId, styles } = options || {};

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
            await this._runAuthenticationFlowOrThrow(methodId, styles);
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
        const paypalConnectSessionId = this._browserStorage.getItem('sessionId');
        const paymentProviderCustomer = state.paymentProviderCustomer.getPaymentProviderCustomer();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        if (
            braintreePaymentProviderCustomer?.authenticationState ===
            BraintreeFastlaneAuthenticationState.CANCELED
        ) {
            return false;
        }

        return (
            !braintreePaymentProviderCustomer?.authenticationState &&
            paypalConnectSessionId === cartId
        );
    }

    private async _runAuthenticationFlowOrThrow(
        methodId: string,
        styles?: BraintreeConnectStylesOption,
    ): Promise<void> {
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfigOrThrow();
        const cart = state.cart.getCartOrThrow();
        const countries = state.countries.getCountries() || [];
        const customer = state.customer.getCustomer();
        const billingAddress = state.billingAddress.getBillingAddress();
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, config } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeIntegrationService.initialize(clientToken, storeConfig);

        const braintreeConnect = await this._braintreeIntegrationService.getBraintreeConnect(
            cart?.id,
            config?.testMode,
            styles,
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

        if (authenticationState === BraintreeFastlaneAuthenticationState.CANCELED) {
            await this._store.dispatch(
                this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                    authenticationState,
                    addresses: [],
                    instruments: [],
                }),
            );

            this._browserStorage.removeItem('sessionId');

            return;
        }

        const shippingAddresses =
            this._mapPayPalToBcAddress(profileData.addresses, countries, profileData.phones) || [];
        const paypalBillingAddresses = this._getPayPalBillingAddresses(profileData) || [];
        const billingAddresses =
            this._mapPayPalToBcAddress(paypalBillingAddresses, countries, profileData.phones) || [];
        const instruments = this._mapPayPalToBcInstrument(methodId, profileData.cards) || [];
        const addresses = this._mergeShippingAndBillingAddresses(
            shippingAddresses,
            billingAddresses,
        );

        await this._store.dispatch(
            this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                authenticationState,
                addresses,
                instruments,
            }),
        );

        if (billingAddresses.length > 0) {
            await this._store.dispatch(
                this._billingAddressActionCreator.updateAddress({
                    ...billingAddresses[0],
                    id: String(billingAddresses[0].id),
                }),
            );
        }

        if (shippingAddresses.length > 0 && cart.lineItems.physicalItems.length > 0) {
            await this._store.dispatch(
                this._consignmentActionCreator.updateAddress(shippingAddresses[0]),
            );
        }
    }

    private _getPayPalBillingAddresses(
        profileData?: BraintreeConnectProfileData,
    ): BraintreeConnectAddress[] | undefined {
        const { cards, name } = profileData || {};

        if (!cards?.length) {
            return;
        }

        return cards.reduce(
            (
                billingAddressesList: BraintreeConnectAddress[],
                instrument: BraintreeConnectVaultedInstrument,
            ) => {
                const { firstName, lastName } = instrument.paymentSource.card.billingAddress;
                const { given_name, surname } = name || {};
                const address = {
                    ...instrument.paymentSource.card.billingAddress,
                    firstName: firstName || given_name,
                    lastName: lastName || surname,
                };
                const isAddressExist = billingAddressesList.some(
                    (existingAddress: BraintreeConnectAddress) =>
                        isEqual(
                            this._normalizeAddress(address),
                            this._normalizeAddress(existingAddress),
                        ),
                );

                return isAddressExist ? billingAddressesList : [...billingAddressesList, address];
            },
            [],
        );
    }

    private _getCountryNameByCountryCode(countryCode: string, countries: Country[]): string {
        const matchedCountry = countries.find((country) => country.code === countryCode);

        return matchedCountry?.name || '';
    }

    private _mapPayPalToBcAddress(
        addresses: BraintreeConnectAddress[],
        countries: Country[],
        phones: BraintreeConnectPhone[],
    ): CustomerAddress[] | undefined {
        const phoneNumber =
            phones && phones[0] ? phones[0].country_code + phones[0].national_number : '';

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
            phone: phoneNumber,
            customFields: [],
        }));
    }

    private _normalizeAddress(address: CustomerAddress | BraintreeConnectAddress) {
        return omit(address, ['id']);
    }

    private _mergeShippingAndBillingAddresses(
        shippingAddresses: CustomerAddress[],
        billingAddresses: CustomerAddress[],
    ): CustomerAddress[] {
        const filteredBillingAddresses = billingAddresses.filter(
            (billingAddress: CustomerAddress) =>
                !shippingAddresses.some((shippingAddress: CustomerAddress) => {
                    return isEqual(
                        this._normalizeAddress(shippingAddress),
                        this._normalizeAddress(billingAddress),
                    );
                }),
        );

        return [...shippingAddresses, ...filteredBillingAddresses];
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
