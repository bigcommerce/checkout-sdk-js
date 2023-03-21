[@bigcommerce/checkout-sdk](../README.md) / CheckoutStoreSelector

# Interface: CheckoutStoreSelector

Responsible for getting the state of the current checkout.

This object has a set of methods that allow you to get a specific piece of
checkout information, such as shipping and billing details.

## Table of contents

### Methods

- [getBillingAddress](CheckoutStoreSelector.md#getbillingaddress)
- [getBillingAddressFields](CheckoutStoreSelector.md#getbillingaddressfields)
- [getBillingCountries](CheckoutStoreSelector.md#getbillingcountries)
- [getCart](CheckoutStoreSelector.md#getcart)
- [getCheckout](CheckoutStoreSelector.md#getcheckout)
- [getConfig](CheckoutStoreSelector.md#getconfig)
- [getConsignments](CheckoutStoreSelector.md#getconsignments)
- [getCoupons](CheckoutStoreSelector.md#getcoupons)
- [getCustomer](CheckoutStoreSelector.md#getcustomer)
- [getCustomerAccountFields](CheckoutStoreSelector.md#getcustomeraccountfields)
- [getFlashMessages](CheckoutStoreSelector.md#getflashmessages)
- [getGiftCertificates](CheckoutStoreSelector.md#getgiftcertificates)
- [getInstruments](CheckoutStoreSelector.md#getinstruments)
- [getOrder](CheckoutStoreSelector.md#getorder)
- [getPaymentMethod](CheckoutStoreSelector.md#getpaymentmethod)
- [getPaymentMethods](CheckoutStoreSelector.md#getpaymentmethods)
- [getPickupOptions](CheckoutStoreSelector.md#getpickupoptions)
- [getSelectedPaymentMethod](CheckoutStoreSelector.md#getselectedpaymentmethod)
- [getSelectedShippingOption](CheckoutStoreSelector.md#getselectedshippingoption)
- [getShippingAddress](CheckoutStoreSelector.md#getshippingaddress)
- [getShippingAddressFields](CheckoutStoreSelector.md#getshippingaddressfields)
- [getShippingCountries](CheckoutStoreSelector.md#getshippingcountries)
- [getShippingOptions](CheckoutStoreSelector.md#getshippingoptions)
- [getSignInEmail](CheckoutStoreSelector.md#getsigninemail)
- [getUserExperienceSettings](CheckoutStoreSelector.md#getuserexperiencesettings)
- [isPaymentDataRequired](CheckoutStoreSelector.md#ispaymentdatarequired)
- [isPaymentDataSubmitted](CheckoutStoreSelector.md#ispaymentdatasubmitted)

## Methods

### getBillingAddress

▸ **getBillingAddress**(): `undefined` \| [`BillingAddress`](BillingAddress.md)

Gets the billing address of an order.

#### Returns

`undefined` \| [`BillingAddress`](BillingAddress.md)

The billing address object if it is loaded, otherwise undefined.

___

### getBillingAddressFields

▸ **getBillingAddressFields**(`countryCode`): [`FormField`](FormField.md)[]

Gets a set of form fields that should be presented to customers in order
to capture their billing address for a specific country.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `countryCode` | `string` | A 2-letter country code (ISO 3166-1 alpha-2). |

#### Returns

[`FormField`](FormField.md)[]

The set of billing address form fields if it is loaded,
otherwise undefined.

___

### getBillingCountries

▸ **getBillingCountries**(): `undefined` \| [`Country`](Country.md)[]

Gets a list of countries available for billing.

#### Returns

`undefined` \| [`Country`](Country.md)[]

The list of countries if it is loaded, otherwise undefined.

___

### getCart

▸ **getCart**(): `undefined` \| [`Cart`](Cart.md)

Gets the current cart.

#### Returns

`undefined` \| [`Cart`](Cart.md)

The current cart object if it is loaded, otherwise undefined.

___

### getCheckout

▸ **getCheckout**(): `undefined` \| [`Checkout`](Checkout.md)

Gets the current checkout.

#### Returns

`undefined` \| [`Checkout`](Checkout.md)

The current checkout if it is loaded, otherwise undefined.

___

### getConfig

▸ **getConfig**(): `undefined` \| [`StoreConfig`](StoreConfig.md)

Gets the checkout configuration of a store.

#### Returns

`undefined` \| [`StoreConfig`](StoreConfig.md)

The configuration object if it is loaded, otherwise undefined.

___

### getConsignments

▸ **getConsignments**(): `undefined` \| [`Consignment`](Consignment.md)[]

Gets a list of consignments.

If there are no consignments created for to the current checkout, the
list will be empty.

#### Returns

`undefined` \| [`Consignment`](Consignment.md)[]

The list of consignments if any, otherwise undefined.

___

### getCoupons

▸ **getCoupons**(): `undefined` \| [`Coupon`](Coupon.md)[]

Gets a list of coupons that are applied to the current checkout.

#### Returns

`undefined` \| [`Coupon`](Coupon.md)[]

The list of applied coupons if there is any, otherwise undefined.

___

### getCustomer

▸ **getCustomer**(): `undefined` \| [`Customer`](Customer.md)

Gets the current customer.

#### Returns

`undefined` \| [`Customer`](Customer.md)

The current customer object if it is loaded, otherwise
undefined.

___

### getCustomerAccountFields

▸ **getCustomerAccountFields**(): [`FormField`](FormField.md)[]

Gets a set of form fields that should be presented in order to create a customer.

#### Returns

[`FormField`](FormField.md)[]

The set of customer account form fields if it is loaded,
otherwise undefined.

___

### getFlashMessages

▸ **getFlashMessages**(`type?`): `undefined` \| [`FlashMessage`](FlashMessage.md)[]

Gets the available flash messages.

Flash messages contain messages set by the server,
e.g: when trying to sign in using an invalid email link.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type?` | ``"error"`` \| ``"info"`` \| ``"warning"`` \| ``"success"`` | The type of flash messages to be returned. Optional |

#### Returns

`undefined` \| [`FlashMessage`](FlashMessage.md)[]

The flash messages if available, otherwise undefined.

___

### getGiftCertificates

▸ **getGiftCertificates**(): `undefined` \| [`GiftCertificate`](GiftCertificate.md)[]

Gets a list of gift certificates that are applied to the current checkout.

#### Returns

`undefined` \| [`GiftCertificate`](GiftCertificate.md)[]

The list of applied gift certificates if there is any, otherwise undefined.

___

### getInstruments

▸ **getInstruments**(): `undefined` \| [`CardInstrument`](CardInstrument.md)[]

Gets a list of payment instruments associated with the current customer.

#### Returns

`undefined` \| [`CardInstrument`](CardInstrument.md)[]

The list of payment instruments if it is loaded, otherwise undefined.

▸ **getInstruments**(`paymentMethod`): `undefined` \| [`PaymentInstrument`](../README.md#paymentinstrument)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `paymentMethod` | [`PaymentMethod`](PaymentMethod.md)<`any`\> |

#### Returns

`undefined` \| [`PaymentInstrument`](../README.md#paymentinstrument)[]

___

### getOrder

▸ **getOrder**(): `undefined` \| [`Order`](Order.md)

Gets the current order.

#### Returns

`undefined` \| [`Order`](Order.md)

The current order if it is loaded, otherwise undefined.

___

### getPaymentMethod

▸ **getPaymentMethod**(`methodId`, `gatewayId?`): `undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>

Gets a payment method by an id.

The method returns undefined if unable to find a payment method with the
specified id, either because it is not available for the customer, or it
is not loaded.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `methodId` | `string` | The identifier of the payment method. |
| `gatewayId?` | `string` | The identifier of a payment provider providing the payment method. |

#### Returns

`undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>

The payment method object if loaded and available, otherwise,
undefined.

___

### getPaymentMethods

▸ **getPaymentMethods**(): `undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>[]

Gets a list of payment methods available for checkout.

#### Returns

`undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>[]

The list of payment methods if it is loaded, otherwise undefined.

___

### getPickupOptions

▸ **getPickupOptions**(`consignmentId`, `searchArea`): `undefined` \| [`PickupOptionResult`](PickupOptionResult.md)[]

Gets a list of pickup options for specified parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `consignmentId` | `string` | Id of consignment. |
| `searchArea` | [`SearchArea`](SearchArea.md) | An object containing of radius and co-ordinates. |

#### Returns

`undefined` \| [`PickupOptionResult`](PickupOptionResult.md)[]

The set of shipping address form fields if it is loaded,
otherwise undefined.

___

### getSelectedPaymentMethod

▸ **getSelectedPaymentMethod**(): `undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>

Gets the payment method that is selected for checkout.

#### Returns

`undefined` \| [`PaymentMethod`](PaymentMethod.md)<`any`\>

The payment method object if there is a selected method;
undefined if otherwise.

___

### getSelectedShippingOption

▸ **getSelectedShippingOption**(): `undefined` \| [`ShippingOption`](ShippingOption.md)

Gets the selected shipping option for the current checkout.

#### Returns

`undefined` \| [`ShippingOption`](ShippingOption.md)

The shipping option object if there is a selected option,
otherwise undefined.

___

### getShippingAddress

▸ **getShippingAddress**(): `undefined` \| [`Address`](Address.md)

Gets the shipping address of the current checkout.

If the address is partially complete, it may not have shipping options
associated with it.

#### Returns

`undefined` \| [`Address`](Address.md)

The shipping address object if it is loaded, otherwise
undefined.

___

### getShippingAddressFields

▸ **getShippingAddressFields**(`countryCode`): [`FormField`](FormField.md)[]

Gets a set of form fields that should be presented to customers in order
to capture their shipping address for a specific country.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `countryCode` | `string` | A 2-letter country code (ISO 3166-1 alpha-2). |

#### Returns

[`FormField`](FormField.md)[]

The set of shipping address form fields if it is loaded,
otherwise undefined.

___

### getShippingCountries

▸ **getShippingCountries**(): `undefined` \| [`Country`](Country.md)[]

Gets a list of countries available for shipping.

#### Returns

`undefined` \| [`Country`](Country.md)[]

The list of countries if it is loaded, otherwise undefined.

___

### getShippingOptions

▸ **getShippingOptions**(): `undefined` \| [`ShippingOption`](ShippingOption.md)[]

Gets a list of shipping options available for the shipping address.

If there is no shipping address assigned to the current checkout, the
list of shipping options will be empty.

#### Returns

`undefined` \| [`ShippingOption`](ShippingOption.md)[]

The list of shipping options if any, otherwise undefined.

___

### getSignInEmail

▸ **getSignInEmail**(): `undefined` \| [`SignInEmail`](SignInEmail.md)

Gets the sign-in email.

#### Returns

`undefined` \| [`SignInEmail`](SignInEmail.md)

The sign-in email object if sent, otherwise undefined

___

### getUserExperienceSettings

▸ **getUserExperienceSettings**(): `undefined` \| [`UserExperienceSettings`](UserExperienceSettings.md)

Gets user experience settings.

#### Returns

`undefined` \| [`UserExperienceSettings`](UserExperienceSettings.md)

The object of user experience settings if it is loaded, otherwise undefined.

___

### isPaymentDataRequired

▸ **isPaymentDataRequired**(`useStoreCredit?`): `boolean`

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

| Name | Type | Description |
| :------ | :------ | :------ |
| `useStoreCredit?` | `boolean` | If true, check whether payment data is required with store credit applied; otherwise, check without store credit. |

#### Returns

`boolean`

True if payment data is required, otherwise false.

___

### isPaymentDataSubmitted

▸ **isPaymentDataSubmitted**(`methodId`, `gatewayId?`): `boolean`

Checks if payment data is submitted or not.

If payment data is already submitted using a payment method, customers
should not be prompted to enter their payment details again.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `methodId` | `string` | The identifier of the payment method. |
| `gatewayId?` | `string` | The identifier of a payment provider providing the payment method. |

#### Returns

`boolean`

True if payment data is submitted, otherwise false.
