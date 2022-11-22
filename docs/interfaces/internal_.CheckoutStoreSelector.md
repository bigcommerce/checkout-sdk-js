[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CheckoutStoreSelector

# Interface: CheckoutStoreSelector

[<internal>](../modules/internal_.md).CheckoutStoreSelector

Responsible for getting the state of the current checkout.

This object has a set of methods that allow you to get a specific piece of
checkout information, such as shipping and billing details.

## Table of contents

### Methods

- [getBillingAddress](internal_.CheckoutStoreSelector.md#getbillingaddress)
- [getBillingAddressFields](internal_.CheckoutStoreSelector.md#getbillingaddressfields)
- [getBillingCountries](internal_.CheckoutStoreSelector.md#getbillingcountries)
- [getCart](internal_.CheckoutStoreSelector.md#getcart)
- [getCheckout](internal_.CheckoutStoreSelector.md#getcheckout)
- [getConfig](internal_.CheckoutStoreSelector.md#getconfig)
- [getConsignments](internal_.CheckoutStoreSelector.md#getconsignments)
- [getCoupons](internal_.CheckoutStoreSelector.md#getcoupons)
- [getCustomer](internal_.CheckoutStoreSelector.md#getcustomer)
- [getCustomerAccountFields](internal_.CheckoutStoreSelector.md#getcustomeraccountfields)
- [getFlashMessages](internal_.CheckoutStoreSelector.md#getflashmessages)
- [getGiftCertificates](internal_.CheckoutStoreSelector.md#getgiftcertificates)
- [getInstruments](internal_.CheckoutStoreSelector.md#getinstruments)
- [getOrder](internal_.CheckoutStoreSelector.md#getorder)
- [getPaymentMethod](internal_.CheckoutStoreSelector.md#getpaymentmethod)
- [getPaymentMethods](internal_.CheckoutStoreSelector.md#getpaymentmethods)
- [getPickupOptions](internal_.CheckoutStoreSelector.md#getpickupoptions)
- [getSelectedPaymentMethod](internal_.CheckoutStoreSelector.md#getselectedpaymentmethod)
- [getSelectedShippingOption](internal_.CheckoutStoreSelector.md#getselectedshippingoption)
- [getShippingAddress](internal_.CheckoutStoreSelector.md#getshippingaddress)
- [getShippingAddressFields](internal_.CheckoutStoreSelector.md#getshippingaddressfields)
- [getShippingCountries](internal_.CheckoutStoreSelector.md#getshippingcountries)
- [getShippingOptions](internal_.CheckoutStoreSelector.md#getshippingoptions)
- [getSignInEmail](internal_.CheckoutStoreSelector.md#getsigninemail)
- [isPaymentDataRequired](internal_.CheckoutStoreSelector.md#ispaymentdatarequired)
- [isPaymentDataSubmitted](internal_.CheckoutStoreSelector.md#ispaymentdatasubmitted)

## Methods

### getBillingAddress

▸ **getBillingAddress**(): `undefined` \| [`BillingAddress`](internal_.BillingAddress.md)

Gets the billing address of an order.

#### Returns

`undefined` \| [`BillingAddress`](internal_.BillingAddress.md)

The billing address object if it is loaded, otherwise undefined.

___

### getBillingAddressFields

▸ **getBillingAddressFields**(`countryCode`): [`FormField`](internal_.FormField.md)[]

Gets a set of form fields that should be presented to customers in order
to capture their billing address for a specific country.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `countryCode` | `string` | A 2-letter country code (ISO 3166-1 alpha-2). |

#### Returns

[`FormField`](internal_.FormField.md)[]

The set of billing address form fields if it is loaded,
otherwise undefined.

___

### getBillingCountries

▸ **getBillingCountries**(): `undefined` \| [`Country`](internal_.Country.md)[]

Gets a list of countries available for billing.

#### Returns

`undefined` \| [`Country`](internal_.Country.md)[]

The list of countries if it is loaded, otherwise undefined.

___

### getCart

▸ **getCart**(): `undefined` \| [`Cart`](internal_.Cart.md)

Gets the current cart.

#### Returns

`undefined` \| [`Cart`](internal_.Cart.md)

The current cart object if it is loaded, otherwise undefined.

___

### getCheckout

▸ **getCheckout**(): `undefined` \| [`Checkout`](internal_.Checkout.md)

Gets the current checkout.

#### Returns

`undefined` \| [`Checkout`](internal_.Checkout.md)

The current checkout if it is loaded, otherwise undefined.

___

### getConfig

▸ **getConfig**(): `undefined` \| [`StoreConfig`](internal_.StoreConfig.md)

Gets the checkout configuration of a store.

#### Returns

`undefined` \| [`StoreConfig`](internal_.StoreConfig.md)

The configuration object if it is loaded, otherwise undefined.

___

### getConsignments

▸ **getConsignments**(): `undefined` \| [`Consignment`](internal_.Consignment.md)[]

Gets a list of consignments.

If there are no consignments created for to the current checkout, the
list will be empty.

#### Returns

`undefined` \| [`Consignment`](internal_.Consignment.md)[]

The list of consignments if any, otherwise undefined.

___

### getCoupons

▸ **getCoupons**(): `undefined` \| [`Coupon`](internal_.Coupon.md)[]

Gets a list of coupons that are applied to the current checkout.

#### Returns

`undefined` \| [`Coupon`](internal_.Coupon.md)[]

The list of applied coupons if there is any, otherwise undefined.

___

### getCustomer

▸ **getCustomer**(): `undefined` \| [`Customer`](internal_.Customer.md)

Gets the current customer.

#### Returns

`undefined` \| [`Customer`](internal_.Customer.md)

The current customer object if it is loaded, otherwise
undefined.

___

### getCustomerAccountFields

▸ **getCustomerAccountFields**(): [`FormField`](internal_.FormField.md)[]

Gets a set of form fields that should be presented in order to create a customer.

#### Returns

[`FormField`](internal_.FormField.md)[]

The set of customer account form fields if it is loaded,
otherwise undefined.

___

### getFlashMessages

▸ **getFlashMessages**(`type?`): `undefined` \| [`FlashMessage`](internal_.FlashMessage.md)[]

Gets the available flash messages.

Flash messages contain messages set by the server,
e.g: when trying to sign in using an invalid email link.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `type?` | [`FlashMessageType`](../modules/internal_.md#flashmessagetype) | The type of flash messages to be returned. Optional |

#### Returns

`undefined` \| [`FlashMessage`](internal_.FlashMessage.md)[]

The flash messages if available, otherwise undefined.

___

### getGiftCertificates

▸ **getGiftCertificates**(): `undefined` \| [`GiftCertificate`](internal_.GiftCertificate.md)[]

Gets a list of gift certificates that are applied to the current checkout.

#### Returns

`undefined` \| [`GiftCertificate`](internal_.GiftCertificate.md)[]

The list of applied gift certificates if there is any, otherwise undefined.

___

### getInstruments

▸ **getInstruments**(): `undefined` \| [`CardInstrument`](internal_.CardInstrument.md)[]

Gets a list of payment instruments associated with the current customer.

#### Returns

`undefined` \| [`CardInstrument`](internal_.CardInstrument.md)[]

The list of payment instruments if it is loaded, otherwise undefined.

▸ **getInstruments**(`paymentMethod`): `undefined` \| [`PaymentInstrument`](../modules/internal_.md#paymentinstrument)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `paymentMethod` | [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\> |

#### Returns

`undefined` \| [`PaymentInstrument`](../modules/internal_.md#paymentinstrument)[]

___

### getOrder

▸ **getOrder**(): `undefined` \| [`Order`](internal_.Order.md)

Gets the current order.

#### Returns

`undefined` \| [`Order`](internal_.Order.md)

The current order if it is loaded, otherwise undefined.

___

### getPaymentMethod

▸ **getPaymentMethod**(`methodId`, `gatewayId?`): `undefined` \| [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\>

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

`undefined` \| [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\>

The payment method object if loaded and available, otherwise,
undefined.

___

### getPaymentMethods

▸ **getPaymentMethods**(): `undefined` \| [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\>[]

Gets a list of payment methods available for checkout.

#### Returns

`undefined` \| [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\>[]

The list of payment methods if it is loaded, otherwise undefined.

___

### getPickupOptions

▸ **getPickupOptions**(`consignmentId`, `searchArea`): `undefined` \| [`PickupOptionResult`](internal_.PickupOptionResult.md)[]

Gets a list of pickup options for specified parameters.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `consignmentId` | `string` | Id of consignment. |
| `searchArea` | [`SearchArea`](internal_.SearchArea.md) | An object containing of radius and co-ordinates. |

#### Returns

`undefined` \| [`PickupOptionResult`](internal_.PickupOptionResult.md)[]

The set of shipping address form fields if it is loaded,
otherwise undefined.

___

### getSelectedPaymentMethod

▸ **getSelectedPaymentMethod**(): `undefined` \| [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\>

Gets the payment method that is selected for checkout.

#### Returns

`undefined` \| [`PaymentMethod`](internal_.PaymentMethod.md)<`any`\>

The payment method object if there is a selected method;
undefined if otherwise.

___

### getSelectedShippingOption

▸ **getSelectedShippingOption**(): `undefined` \| [`ShippingOption`](internal_.ShippingOption.md)

Gets the selected shipping option for the current checkout.

#### Returns

`undefined` \| [`ShippingOption`](internal_.ShippingOption.md)

The shipping option object if there is a selected option,
otherwise undefined.

___

### getShippingAddress

▸ **getShippingAddress**(): `undefined` \| [`Address`](internal_.Address.md)

Gets the shipping address of the current checkout.

If the address is partially complete, it may not have shipping options
associated with it.

#### Returns

`undefined` \| [`Address`](internal_.Address.md)

The shipping address object if it is loaded, otherwise
undefined.

___

### getShippingAddressFields

▸ **getShippingAddressFields**(`countryCode`): [`FormField`](internal_.FormField.md)[]

Gets a set of form fields that should be presented to customers in order
to capture their shipping address for a specific country.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `countryCode` | `string` | A 2-letter country code (ISO 3166-1 alpha-2). |

#### Returns

[`FormField`](internal_.FormField.md)[]

The set of shipping address form fields if it is loaded,
otherwise undefined.

___

### getShippingCountries

▸ **getShippingCountries**(): `undefined` \| [`Country`](internal_.Country.md)[]

Gets a list of countries available for shipping.

#### Returns

`undefined` \| [`Country`](internal_.Country.md)[]

The list of countries if it is loaded, otherwise undefined.

___

### getShippingOptions

▸ **getShippingOptions**(): `undefined` \| [`ShippingOption`](internal_.ShippingOption.md)[]

Gets a list of shipping options available for the shipping address.

If there is no shipping address assigned to the current checkout, the
list of shipping options will be empty.

#### Returns

`undefined` \| [`ShippingOption`](internal_.ShippingOption.md)[]

The list of shipping options if any, otherwise undefined.

___

### getSignInEmail

▸ **getSignInEmail**(): `undefined` \| [`SignInEmail`](internal_.SignInEmail.md)

Gets the sign-in email.

#### Returns

`undefined` \| [`SignInEmail`](internal_.SignInEmail.md)

The sign-in email object if sent, otherwise undefined

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
