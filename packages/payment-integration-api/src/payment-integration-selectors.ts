import { BillingAddress } from './billing';
import { Cart } from './cart';
import { Checkout } from './checkout';
import { StoreConfig } from './config';
import Config, { ContextConfig } from './config/config';
import { Customer } from './customer';
import { Country } from './geography';
import { Order } from './order';
import { OrderMetaState } from './order/order-state';
import { InstrumentMeta } from './payment';
import { PaymentProviderCustomer } from './payment-provider-customer';
import PaymentInstrument, { CardInstrument } from './payment/instrument';
import PaymentMethod from './payment/payment-method';
import PaymentMethodMeta from './payment/payment-method-meta';
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

    getContextConfig(): ContextConfig | undefined;

    getCustomer(): Customer | undefined;
    getCustomerOrThrow(): Customer;

    getCardInstrument(instrumentId: string): CardInstrument | undefined;
    getCardInstrumentOrThrow(instrumentId: string): CardInstrument;

    getInstruments(): PaymentInstrument[] | undefined;

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

    getShippingCountries(): Country[] | undefined;

    getOutstandingBalance(useStoreCredit?: boolean): number | undefined;

    isPaymentDataRequired(useStoreCredit?: boolean): boolean;
    isPaymentMethodInitialized(query: { methodId: string; gatewayId?: string }): boolean;

    getConfig(): Config | undefined;

    getInstrumentsMeta(): InstrumentMeta | undefined;

    getStorefrontJwtToken(): string | undefined;

    getOrderMeta(): OrderMetaState | undefined;

    getPaymentMethodsMeta(): PaymentMethodMeta | undefined;
}
