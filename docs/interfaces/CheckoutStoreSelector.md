[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutStoreSelector

# Interface: CheckoutStoreSelector

Responsible for getting the state of the current checkout.

This object has a set of methods that allow you to get a specific piece of
checkout information, such as shipping and billing details.

## Methods

### getAddressExtraFields()

> **getAddressExtraFields**(): [`FormField`](FormField.md)[]

Gets address extra fields.

#### Returns

[`FormField`](FormField.md)[]

The list of extra fields if available, otherwise an empty array.

***

### getB2BContext()

> **getB2BContext**(): [`B2BContext`](B2BContext.md) \| `undefined`

Gets the B2B context of the current order.

#### Returns

[`B2BContext`](B2BContext.md) \| `undefined`

The B2B context if it is available, otherwise undefined.

***

### getB2BToken()

> **getB2BToken**(): `string` \| `undefined`

Gets the B2B authentication token for the current customer.

#### Returns

`string` \| `undefined`

The B2B token string if it has been loaded, otherwise undefined.

***

### getBillingAddress()

> **getBillingAddress**(): [`BillingAddress`](BillingAddress.md) \| `undefined`

Gets the billing address of an order.

#### Returns

[`BillingAddress`](BillingAddress.md) \| `undefined`

The billing address object if it is loaded, otherwise undefined.

***

### getBillingAddressFields()

> **getBillingAddressFields**(`countryCode`): [`FormField`](FormField.md)[]

Gets a set of form fields that should be presented to customers in order
to capture their billing address for a specific country.

#### Parameters

##### countryCode

`string`

A 2-letter country code (ISO 3166-1 alpha-2).

#### Returns

[`FormField`](FormField.md)[]

The set of billing address form fields if it is loaded,
otherwise undefined.

***

### getBillingCountries()

> **getBillingCountries**(): [`Country`](Country.md)[] \| `undefined`

Gets a list of countries available for billing.

#### Returns

[`Country`](Country.md)[] \| `undefined`

The list of countries if it is loaded, otherwise undefined.

***

### getCart()

> **getCart**(): [`Cart`](Cart.md) \| `undefined`

Gets the current cart.

#### Returns

[`Cart`](Cart.md) \| `undefined`

The current cart object if it is loaded, otherwise undefined.

***

### getCheckout()

> **getCheckout**(): [`Checkout`](Checkout.md) \| `undefined`

Gets the current checkout.

#### Returns

[`Checkout`](Checkout.md) \| `undefined`

The current checkout if it is loaded, otherwise undefined.

***

### getConfig()

> **getConfig**(): [`StoreConfig`](StoreConfig.md) \| `undefined`

Gets the checkout configuration of a store.

#### Returns

[`StoreConfig`](StoreConfig.md) \| `undefined`

The configuration object if it is loaded, otherwise undefined.

***

### getConsignments()

> **getConsignments**(): [`Consignment`](Consignment.md)[] \| `undefined`

Gets a list of consignments.

If there are no consignments created for to the current checkout, the
list will be empty.

#### Returns

[`Consignment`](Consignment.md)[] \| `undefined`

The list of consignments if any, otherwise undefined.

***

### getCoupons()

> **getCoupons**(): [`Coupon`](Coupon.md)[] \| `undefined`

Gets a list of coupons that are applied to the current checkout.

#### Returns

[`Coupon`](Coupon.md)[] \| `undefined`

The list of applied coupons if there is any, otherwise undefined.

***

### getCustomer()

> **getCustomer**(): [`Customer`](Customer.md) \| `undefined`

Gets the current customer.

#### Returns

[`Customer`](Customer.md) \| `undefined`

The current customer object if it is loaded, otherwise
undefined.

***

### getCustomerAccountFields()

> **getCustomerAccountFields**(): [`FormField`](FormField.md)[]

Gets a set of form fields that should be presented in order to create a customer.

#### Returns

[`FormField`](FormField.md)[]

The set of customer account form fields if it is loaded,
otherwise undefined.

***

### getExtensionByRegion()

> **getExtensionByRegion**(`region`): [`Extension`](Extension.md) \| `undefined`

**`Alpha`**

Gets the extension associated with a given region.

#### Parameters

##### region

[`ExtensionRegion`](../enumerations/ExtensionRegion.md)

A checkout extension region.

#### Returns

[`Extension`](Extension.md) \| `undefined`

The extension corresponding to the specified region, otherwise undefined.

***

### getExtensions()

> **getExtensions**(): [`Extension`](Extension.md)[] \| `undefined`

**`Alpha`**

Gets a list of extensions available for checkout.

#### Returns

[`Extension`](Extension.md)[] \| `undefined`

The list of extensions if it is loaded, otherwise undefined.

***

### getFlashMessages()

> **getFlashMessages**(`type?`): [`FlashMessage`](FlashMessage.md)[] \| `undefined`

Gets the available flash messages.

Flash messages contain messages set by the server,
e.g: when trying to sign in using an invalid email link.

#### Parameters

##### type?

[`FlashMessageType`](../type-aliases/FlashMessageType.md)

The type of flash messages to be returned. Optional

#### Returns

[`FlashMessage`](FlashMessage.md)[] \| `undefined`

The flash messages if available, otherwise undefined.

***

### getGiftCertificates()

> **getGiftCertificates**(): [`GiftCertificate`](GiftCertificate.md)[] \| `undefined`

Gets a list of gift certificates that are applied to the current checkout.

#### Returns

[`GiftCertificate`](GiftCertificate.md)[] \| `undefined`

The list of applied gift certificates if there is any, otherwise undefined.

***

### getInstruments()

#### Call Signature

> **getInstruments**(): [`CardInstrument`](CardInstrument.md)[] \| `undefined`

Gets a list of payment instruments associated with the current customer.

##### Returns

[`CardInstrument`](CardInstrument.md)[] \| `undefined`

The list of payment instruments if it is loaded, otherwise undefined.

#### Call Signature

> **getInstruments**(`paymentMethod`): [`PaymentInstrument`](../type-aliases/PaymentInstrument.md)[] \| `undefined`

##### Parameters

###### paymentMethod

[`PaymentMethod`](PaymentMethod.md)

##### Returns

[`PaymentInstrument`](../type-aliases/PaymentInstrument.md)[] \| `undefined`

***

### getOrder()

> **getOrder**(): [`Order`](Order.md) \| `undefined`

Gets the current order.

#### Returns

[`Order`](Order.md) \| `undefined`

The current order if it is loaded, otherwise undefined.

***

### getOrderExtraFields()

> **getOrderExtraFields**(): [`FormField`](FormField.md)[]

Gets order extra fields.

#### Returns

[`FormField`](FormField.md)[]

The list of extra fields if available, otherwise an empty array.

***

### getPaymentMethod()

> **getPaymentMethod**(`methodId`, `gatewayId?`): [`PaymentMethod`](PaymentMethod.md)\<`any`\> \| `undefined`

Gets a payment method by an id.

The method returns undefined if unable to find a payment method with the
specified id, either because it is not available for the customer, or it
is not loaded.

#### Parameters

##### methodId

`string`

The identifier of the payment method.

##### gatewayId?

`string`

The identifier of a payment provider providing the
payment method.

#### Returns

[`PaymentMethod`](PaymentMethod.md)\<`any`\> \| `undefined`

The payment method object if loaded and available, otherwise,
undefined.

***

### getPaymentMethods()

> **getPaymentMethods**(): [`PaymentMethod`](PaymentMethod.md)\<`any`\>[] \| `undefined`

Gets a list of payment methods available for checkout.

#### Returns

[`PaymentMethod`](PaymentMethod.md)\<`any`\>[] \| `undefined`

The list of payment methods if it is loaded, otherwise undefined.

***

### getPaymentProviderCustomer()

> **getPaymentProviderCustomer**(): `PaymentProviderCustomer` \| `undefined`

**`Alpha`**

Gets payment provider customers data.

#### Returns

`PaymentProviderCustomer` \| `undefined`

The object with payment provider customer data

***

### getPickupOptions()

> **getPickupOptions**(`consignmentId`, `searchArea`): [`PickupOptionResult`](PickupOptionResult.md)[] \| `undefined`

Gets a list of pickup options for specified parameters.

#### Parameters

##### consignmentId

`string`

Id of consignment.

##### searchArea

[`SearchArea`](SearchArea.md)

An object containing of radius and co-ordinates.

#### Returns

[`PickupOptionResult`](PickupOptionResult.md)[] \| `undefined`

The set of shipping address form fields if it is loaded,
otherwise undefined.

***

### getSelectedPaymentMethod()

> **getSelectedPaymentMethod**(): [`PaymentMethod`](PaymentMethod.md)\<`any`\> \| `undefined`

Gets the payment method that is selected for checkout.

#### Returns

[`PaymentMethod`](PaymentMethod.md)\<`any`\> \| `undefined`

The payment method object if there is a selected method;
undefined if otherwise.

***

### getSelectedShippingOption()

> **getSelectedShippingOption**(): [`ShippingOption`](ShippingOption.md) \| `undefined`

Gets the selected shipping option for the current checkout.

#### Returns

[`ShippingOption`](ShippingOption.md) \| `undefined`

The shipping option object if there is a selected option,
otherwise undefined.

***

### getShippingAddress()

> **getShippingAddress**(): [`Address`](Address.md) \| `undefined`

Gets the shipping address of the current checkout.

If the address is partially complete, it may not have shipping options
associated with it.

#### Returns

[`Address`](Address.md) \| `undefined`

The shipping address object if it is loaded, otherwise
undefined.

***

### getShippingAddressFields()

> **getShippingAddressFields**(`countryCode`): [`FormField`](FormField.md)[]

Gets a set of form fields that should be presented to customers in order
to capture their shipping address for a specific country.

#### Parameters

##### countryCode

`string`

A 2-letter country code (ISO 3166-1 alpha-2).

#### Returns

[`FormField`](FormField.md)[]

The set of shipping address form fields if it is loaded,
otherwise undefined.

***

### getShippingCountries()

> **getShippingCountries**(): [`Country`](Country.md)[] \| `undefined`

Gets a list of countries available for shipping.

#### Returns

[`Country`](Country.md)[] \| `undefined`

The list of countries if it is loaded, otherwise undefined.

***

### getShippingOptions()

> **getShippingOptions**(): [`ShippingOption`](ShippingOption.md)[] \| `undefined`

Gets a list of shipping options available for the shipping address.

If there is no shipping address assigned to the current checkout, the
list of shipping options will be empty.

#### Returns

[`ShippingOption`](ShippingOption.md)[] \| `undefined`

The list of shipping options if any, otherwise undefined.

***

### getSignInEmail()

> **getSignInEmail**(): [`SignInEmail`](SignInEmail.md) \| `undefined`

Gets the sign-in email.

#### Returns

[`SignInEmail`](SignInEmail.md) \| `undefined`

The sign-in email object if sent, otherwise undefined

***

### getUserExperienceSettings()

> **getUserExperienceSettings**(): [`UserExperienceSettings`](UserExperienceSettings.md) \| `undefined`

Gets user experience settings.

#### Returns

[`UserExperienceSettings`](UserExperienceSettings.md) \| `undefined`

The object of user experience settings if it is loaded, otherwise undefined.

***

### isPaymentDataRequired()

> **isPaymentDataRequired**(`useStoreCredit?`): `boolean`

Checks if payment data is required or not.

If payment data is required, customers should be prompted to enter their
payment details.

```js
if (state.checkout.isPaymentDataRequired()) {
    // Render payment form
} else {
    // Render "Payment is not required for this order" message
}
```

#### Parameters

##### useStoreCredit?

`boolean`

If true, check whether payment data is required
with store credit applied; otherwise, check without store credit.

#### Returns

`boolean`

True if payment data is required, otherwise false.

***

### isPaymentDataSubmitted()

> **isPaymentDataSubmitted**(`methodId`, `gatewayId?`): `boolean`

Checks if payment data is submitted or not.

If payment data is already submitted using a payment method, customers
should not be prompted to enter their payment details again.

#### Parameters

##### methodId

`string`

The identifier of the payment method.

##### gatewayId?

`string`

The identifier of a payment provider providing the
payment method.

#### Returns

`boolean`

True if payment data is submitted, otherwise false.
