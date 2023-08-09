import { BillingAddress } from './billing';
import { Cart } from './cart';
import { Checkout } from './checkout';
import { StoreConfig } from './config';
import { Customer } from './customer';
import { Country } from './geography';
import { Order } from './order';
import { PaymentProviderCustomer } from './payment-provider-customer';
import { CardInstrument } from './payment/instrument';
import PaymentMethod from './payment/payment-method';
import { Consignment, ShippingAddress } from './shipping';

export default interface PaymentIntegrationSelectors {
    getHost(): string | undefined;
    getLocale(): string | undefined;

    getBillingAddress(): BillingAddress | undefined;
    getBillingAddressOrThrow(): BillingAddress;

    getCountries(): Country[] | undefined;

    getCart(): Cart | undefined;
    getCartOrThrow(): Cart;

    getCheckout(): Checkout | undefined;
    getCheckoutOrThrow(): Checkout;

    getStoreConfig(): StoreConfig | undefined;
    getStoreConfigOrThrow(): StoreConfig;

    getConsignments(): Consignment[] | undefined;
    getConsignmentsOrThrow(): Consignment[];

    getCustomer(): Customer | undefined;
    getCustomerOrThrow(): Customer;

    getCardInstrument(instrumentId: string): CardInstrument | undefined;
    getCardInstrumentOrThrow(instrumentId: string): CardInstrument;

    getOrder(): Order | undefined;
    getOrderOrThrow(): Order;

    getPaymentToken(): string | undefined;
    getPaymentTokenOrThrow(): string;

    getPaymentId(): { providerId: string; gatewayId?: string } | undefined;
    getPaymentIdOrThrow(): { providerId: string; gatewayId?: string };

    getPaymentStatus(): string | undefined;
    getPaymentStatusOrThrow(): string;

    getPaymentRedirectUrl(): string | undefined;
    getPaymentRedirectUrlOrThrow(): string;

    getPaymentMethod<T = unknown>(
        methodId: string,
        gatewayId?: string,
    ): PaymentMethod<T> | undefined;
    getPaymentMethodOrThrow<T = unknown>(methodId: string, gatewayId?: string): PaymentMethod<T>;

    getPaymentProviderCustomer(): PaymentProviderCustomer | undefined;
    getPaymentProviderCustomerOrThrow(): PaymentProviderCustomer;

    getShippingAddress(): ShippingAddress | undefined;
    getShippingAddressOrThrow(): ShippingAddress;
    getShippingAddresses(): ShippingAddress[];
    getShippingAddressesOrThrow(): ShippingAddress[];

    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    isPaymentMethodInitialized(query: { methodId: string; gatewayId?: string }): boolean;
}
