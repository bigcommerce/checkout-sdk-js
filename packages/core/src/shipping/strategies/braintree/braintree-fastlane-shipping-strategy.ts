import { isEqual, omit } from 'lodash';

import {
    BraintreeFastlaneAddress,
    BraintreeFastlaneAuthenticationState,
    BraintreeFastlaneProfileData,
    BraintreeFastlaneStylesOption,
    BraintreeFastlaneVaultedInstrument,
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
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { PaymentProviderCustomerActionCreator } from '../../../payment-provider-customer';
import { CardInstrument } from '../../../payment/instrument';
import { UntrustedShippingCardVerificationType } from '../../../payment/instrument/instrument';
import { BraintreeInitializationData } from '../../../payment/strategies/braintree';
import ConsignmentActionCreator from '../../consignment-action-creator';
import { ShippingInitializeOptions, ShippingRequestOptions } from '../../shipping-request-options';
import ShippingStrategy from '../shipping-strategy';

export default class BraintreeFastlaneShippingStrategy implements ShippingStrategy {
    private _browserStorage: BrowserStorage;

    constructor(
        private _store: CheckoutStore,
        private _billingAddressActionCreator: BillingAddressActionCreator,
        private _consignmentActionCreator: ConsignmentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentProviderCustomerActionCreator: PaymentProviderCustomerActionCreator,
        private _braintreeIntegrationService: BraintreeIntegrationService,
    ) {
        this._browserStorage = new BrowserStorage('paypalFastlane');
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

    async initialize(options: ShippingInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId, braintreefastlane } = options || {};
        const { onPayPalFastlaneAddressChange } = braintreefastlane || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" argument is not provided.',
            );
        }

        const state = this._store.getState();
        const customer = state.customer.getCustomerOrThrow();

        if (!customer.isGuest) {
            return Promise.resolve(this._store.getState());
        }

        try {
            if (this._shouldRunAuthenticationFlow()) {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!paymentMethod?.initializationData?.clientToken) {
                    await this._store.dispatch(
                        this._paymentMethodActionCreator.loadPaymentMethod(methodId),
                    );
                }

                await this._runAuthenticationFlowOrThrow(methodId, braintreefastlane?.styles);
            }

            if (
                typeof onPayPalFastlaneAddressChange === 'function' &&
                (await this._shouldUseBraintreeFastlaneShippingComponent(methodId))
            ) {
                onPayPalFastlaneAddressChange(() =>
                    this._handleBraintreeFastlaneShippingAddressChange(),
                );
            }
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
        const paypalFastlaneSessionId = this._browserStorage.getItem('sessionId');
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
            paypalFastlaneSessionId === cartId
        );
    }

    private async _runAuthenticationFlowOrThrow(
        methodId: string,
        styles?: BraintreeFastlaneStylesOption,
    ): Promise<void> {
        const state = this._store.getState();
        const storeConfig = state.config.getStoreConfigOrThrow();
        const cart = state.cart.getCartOrThrow();
        const countries = state.countries.getCountries() || [];
        const paymentMethod = state.paymentMethods.getPaymentMethodOrThrow(methodId);
        const { clientToken, config } = paymentMethod;

        if (!clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        this._braintreeIntegrationService.initialize(clientToken, storeConfig);

        const braintreeFastlane = await this._braintreeIntegrationService.getBraintreeFastlane(
            cart?.id,
            config?.testMode,
            styles,
        );

        const customerEmail =
            state.customer.getCustomer()?.email || state.billingAddress.getBillingAddress()?.email;

        if (!customerEmail) {
            return;
        }

        const { lookupCustomerByEmail, triggerAuthenticationFlow } = braintreeFastlane.identity;

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

        const paypalBillingAddress = this._getPayPalBillingAddress(profileData);
        const paypalShippingAddress = profileData.shippingAddress;
        const paypalPhoneNumber = profileData.shippingAddress.phoneNumber;

        const shippingAddress = this._mapPayPalToBcAddress(
            paypalShippingAddress,
            countries,
            paypalPhoneNumber,
        );
        const billingAddress = this._mapPayPalToBcAddress(
            paypalBillingAddress,
            countries,
            paypalPhoneNumber,
        );

        if (billingAddress && shippingAddress) {
            const addresses = this._mergeShippingAndBillingAddresses(
                shippingAddress,
                billingAddress,
            );
            const instrument = this._mapPayPalToBcInstrument(methodId, profileData.card);
            const instruments = instrument ? [instrument] : [];

            await this._store.dispatch(
                this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                    authenticationState,
                    addresses,
                    instruments,
                }),
            );

            if (billingAddress) {
                await this._store.dispatch(
                    this._billingAddressActionCreator.updateAddress({
                        ...billingAddress,
                        id: String(billingAddress.id),
                    }),
                );
            }

            if (shippingAddress && cart.lineItems.physicalItems.length > 0) {
                await this._store.dispatch(
                    this._consignmentActionCreator.updateAddress(shippingAddress),
                );
            }
        }
    }

    private _getPayPalBillingAddress(
        profileData: BraintreeFastlaneProfileData,
    ): BraintreeFastlaneAddress {
        const { name, card } = profileData;
        const paypalBillingAddress = card.paymentSource.card.billingAddress;

        return {
            ...paypalBillingAddress,
            firstName: paypalBillingAddress.firstName || name?.firstName,
            lastName: paypalBillingAddress.lastName || name?.lastName,
        };
    }

    private _getCountryNameByCountryCode(countryCode: string, countries: Country[]): string {
        const matchedCountry = countries.find((country) => country.code === countryCode);

        return matchedCountry?.name || '';
    }

    private _mapPayPalToBcAddress(
        address: BraintreeFastlaneAddress,
        countries: Country[],
        phoneNumber?: string,
        customFields?: CustomerAddress['customFields'],
    ): CustomerAddress {
        return {
            id: Number(Date.now()),
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
            phone: phoneNumber || '',
            customFields: customFields || [],
        };
    }

    private _normalizeAddress(address: CustomerAddress | BraintreeFastlaneAddress) {
        return omit(address, ['id']);
    }

    private _mergeShippingAndBillingAddresses(
        shippingAddress: CustomerAddress,
        billingAddress: CustomerAddress,
    ): CustomerAddress[] {
        const addressesAreTheSame = isEqual(
            this._normalizeAddress(shippingAddress),
            this._normalizeAddress(billingAddress),
        );

        return addressesAreTheSame ? [shippingAddress] : [shippingAddress, billingAddress];
    }

    private _mapPayPalToBcInstrument(
        methodId: string,
        instrument?: BraintreeFastlaneVaultedInstrument,
    ): CardInstrument | undefined {
        if (!instrument) {
            return;
        }

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
    }

    /**
     *
     * Braintree Fastlane shipping address change through Fastlane external popup
     *
     */
    private async _handleBraintreeFastlaneShippingAddressChange(): Promise<
        CustomerAddress | undefined
    > {
        const state = this._store.getState();
        const countries = state.countries.getCountries() || [];
        const braintreeFastlane = await this._braintreeIntegrationService.getBraintreeFastlane();

        const { selectionChanged, selectedAddress } =
            await braintreeFastlane.profile.showShippingAddressSelector();

        if (selectionChanged) {
            const state = this._store.getState();
            const shipping = state.shippingAddress.getShippingAddressesOrThrow();
            const paymentProviderCustomer =
                state.paymentProviderCustomer.getPaymentProviderCustomer();
            const braintreeFastlaneCustomer = isBraintreeAcceleratedCheckoutCustomer(
                paymentProviderCustomer,
            )
                ? paymentProviderCustomer
                : {};

            const shippingAddress = this._mapPayPalToBcAddress(
                selectedAddress,
                countries,
                selectedAddress.phoneNumber,
                shipping[0].customFields,
            );

            if (shippingAddress) {
                const paymentProviderCustomerAddresses = this._filterAddresses([
                    shippingAddress,
                    ...(braintreeFastlaneCustomer.addresses || []),
                ]);

                await this._store.dispatch(
                    this._paymentProviderCustomerActionCreator.updatePaymentProviderCustomer({
                        ...braintreeFastlaneCustomer,
                        addresses: paymentProviderCustomerAddresses,
                    }),
                );

                await this._store.dispatch(
                    this._consignmentActionCreator.updateAddress(shippingAddress),
                );

                return shippingAddress;
            }
        }

        return undefined;
    }

    /**
     *
     * This method is responsible for filtering BT Fastlane addresses if they are the same
     * and returns an array of addresses to use them for shipping and/or billing address selections
     * so the customer will be able to use addresses from BT Fastlane in checkout flow
     *
     */
    private _filterAddresses(addresses: Array<CustomerAddress | undefined>): CustomerAddress[] {
        return addresses.reduce(
            (customerAddresses: CustomerAddress[], currentAddress: CustomerAddress | undefined) => {
                if (!currentAddress) {
                    return customerAddresses;
                }

                const sameAddressInTheArray = customerAddresses.some((customerAddress) =>
                    this._isEqualAddresses(customerAddress, currentAddress),
                );

                return sameAddressInTheArray
                    ? customerAddresses
                    : [...customerAddresses, currentAddress];
            },
            [],
        );
    }

    private _isEqualAddresses(
        firstAddress: CustomerAddress,
        secondAddress: CustomerAddress,
    ): boolean {
        return isEqual(this._normalizeAddress(firstAddress), this._normalizeAddress(secondAddress));
    }

    // TODO: reimplement this method when PAYPAL-3996.paypal_fastlane_shipping_update and Fastlane features will be rolled out to 100%
    private async _shouldUseBraintreeFastlaneShippingComponent(methodId: string): Promise<boolean> {
        const state = this._store.getState();
        const features = state.config.getStoreConfigOrThrow().checkoutSettings.features;
        const paymentProviderCustomer = state.paymentProviderCustomer.getPaymentProviderCustomer();
        const braintreePaymentProviderCustomer = isBraintreeAcceleratedCheckoutCustomer(
            paymentProviderCustomer,
        )
            ? paymentProviderCustomer
            : {};

        // Info: to avoid loading payment method we should check for values
        // that does not require api calls first
        if (
            features &&
            features['PAYPAL-3996.paypal_fastlane_shipping_update'] &&
            !!braintreePaymentProviderCustomer &&
            braintreePaymentProviderCustomer !== BraintreeFastlaneAuthenticationState.CANCELED
        ) {
            const paymentMethod = await this._getBraintreePaymentMethodOrThrow(methodId);

            return !!paymentMethod?.initializationData?.isFastlaneEnabled;
        }

        return false;
    }

    private async _getBraintreePaymentMethodOrThrow(
        methodId: string,
    ): Promise<PaymentMethod<BraintreeInitializationData>> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

        if (!paymentMethod) {
            const newState = await this._store.dispatch(
                this._paymentMethodActionCreator.loadPaymentMethod(methodId),
            );

            return newState.paymentMethods.getPaymentMethodOrThrow(methodId);
        }

        return paymentMethod;
    }
}
