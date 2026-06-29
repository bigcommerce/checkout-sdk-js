[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / CheckoutStoreErrorSelector

# Interface: CheckoutStoreErrorSelector

Responsible for getting the error of any asynchronous checkout action, if
there is any.

This object has a set of getters that would return an error if an action is
not executed successfully. For example, if you are unable to submit an order,
you can use this object to retrieve the reason for the failure.

## Methods

### getApplyCouponError()

> **getApplyCouponError**(): [`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

Returns an error if unable to apply a coupon code.

#### Returns

[`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

The error object if unable to apply, otherwise undefined.

***

### getApplyGiftCertificateError()

> **getApplyGiftCertificateError**(): [`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

Returns an error if unable to apply a gift certificate.

#### Returns

[`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

The error object if unable to apply, otherwise undefined.

***

### getApplyStoreCreditError()

> **getApplyStoreCreditError**(): [`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

Returns an error if unable to apply store credit.

#### Returns

[`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

The error object if unable to apply, otherwise undefined.

***

### getContinueAsGuestError()

> **getContinueAsGuestError**(): `Error` \| `undefined`

Returns an error if unable to continue as guest.

The call could fail in scenarios where guest checkout is not allowed, for example, when existing accounts are required to sign-in.

In the background, this call tries to set the billing address email using the Storefront API. You could access the Storefront API response status code using `getContinueAsGuestError` error selector.

```js
console.log(state.errors.getContinueAsGuestError());
console.log(state.errors.getContinueAsGuestError().status);
```

For more information about status codes, check [Checkout Storefront API - Add Checkout Billing Address](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-checkout-api/checkout-billing-address/checkoutsbillingaddressbycheckoutidpost).

#### Returns

`Error` \| `undefined`

The error object if unable to continue, otherwise undefined.

***

### getCreateConsignmentsError()

> **getCreateConsignmentsError**(): `Error` \| `undefined`

Returns an error if unable to create consignments.

#### Returns

`Error` \| `undefined`

The error object if unable to create, otherwise undefined.

***

### getCreateCustomerAccountError()

> **getCreateCustomerAccountError**(): `Error` \| `undefined`

Returns an error if unable to create customer account.

#### Returns

`Error` \| `undefined`

The error object if unable to create account, otherwise undefined.

***

### getCreateCustomerAddressError()

> **getCreateCustomerAddressError**(): `Error` \| `undefined`

Returns an error if unable to create customer address.

#### Returns

`Error` \| `undefined`

The error object if unable to create address, otherwise undefined.

***

### getDeleteCheckoutError()

> **getDeleteCheckoutError**(): `Error` \| `undefined`

Returns an error if unable to delete the current checkout.

#### Returns

`Error` \| `undefined`

The error object if unable to delete, otherwise undefined.

***

### getDeleteConsignmentError()

> **getDeleteConsignmentError**(`consignmentId?`): `Error` \| `undefined`

Returns an error if unable to delete a consignment.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

#### Parameters

##### consignmentId?

`string`

The identifier of the consignment to be checked.

#### Returns

`Error` \| `undefined`

The error object if unable to delete, otherwise undefined.

***

### getDeleteInstrumentError()

> **getDeleteInstrumentError**(`instrumentId?`): `Error` \| `undefined`

Returns an error if unable to delete a payment instrument.

#### Parameters

##### instrumentId?

`string`

The identifier of the payment instrument to delete.

#### Returns

`Error` \| `undefined`

The error object if unable to delete, otherwise undefined.

***

### getError()

> **getError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getFinalizeOrderError()

> **getFinalizeOrderError**(): `Error` \| `undefined`

Returns an error if unable to finalize the current order.

#### Returns

`Error` \| `undefined`

The error object if unable to finalize, otherwise undefined.

***

### getInitializeCustomerError()

> **getInitializeCustomerError**(`methodId?`): `Error` \| `undefined`

Returns an error if unable to initialize the customer step of a checkout
process.

#### Parameters

##### methodId?

`string`

The identifer of the initialization method to execute.

#### Returns

`Error` \| `undefined`

The error object if unable to initialize, otherwise undefined.

***

### getInitializePaymentError()

> **getInitializePaymentError**(`methodId?`): `Error` \| `undefined`

Returns an error if unable to initialize a specific payment method.

#### Parameters

##### methodId?

`string`

The identifier of the payment method to initialize.

#### Returns

`Error` \| `undefined`

The error object if unable to initialize, otherwise undefined.

***

### getInitializeShippingError()

> **getInitializeShippingError**(`methodId?`): `Error` \| `undefined`

Returns an error if unable to initialize the shipping step of a checkout
process.

#### Parameters

##### methodId?

`string`

The identifer of the initialization method to execute.

#### Returns

`Error` \| `undefined`

The error object if unable to initialize, otherwise undefined.

***

### getLoadB2BTokenError()

> **getLoadB2BTokenError**(): `Error` \| `undefined`

Returns an error if unable to load the B2B token.

#### Returns

`Error` \| `undefined`

The error object if unable to load the B2B token, otherwise undefined.

***

### getLoadBillingCountriesError()

> **getLoadBillingCountriesError**(): `Error` \| `undefined`

Returns an error if unable to load billing countries.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadCartError()

> **getLoadCartError**(): `Error` \| `undefined`

Returns an error if unable to load the current cart.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadCheckoutError()

> **getLoadCheckoutError**(): `Error` \| `undefined`

Returns an error if unable to load the current checkout.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadConfigError()

> **getLoadConfigError**(): `Error` \| `undefined`

Returns an error if unable to load the checkout configuration of a store.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadExtensionsError()

> **getLoadExtensionsError**(): `Error` \| `undefined`

**`Alpha`**

Returns an error if unable to fetch extensions.

#### Returns

`Error` \| `undefined`

The error object if unable to fetch extensions, otherwise undefined.

***

### getLoadInstrumentsError()

> **getLoadInstrumentsError**(): `Error` \| `undefined`

Returns an error if unable to load payment instruments.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadOrderError()

> **getLoadOrderError**(): `Error` \| `undefined`

Returns an error if unable to load the current order.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadPaymentMethodError()

> **getLoadPaymentMethodError**(`methodId?`): `Error` \| `undefined`

Returns an error if unable to load a specific payment method.

#### Parameters

##### methodId?

`string`

The identifier of the payment method to load.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadPaymentMethodsError()

> **getLoadPaymentMethodsError**(): `Error` \| `undefined`

Returns an error if unable to load payment methods.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadShippingCountriesError()

> **getLoadShippingCountriesError**(): `Error` \| `undefined`

Returns an error if unable to load shipping countries.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getLoadShippingOptionsError()

> **getLoadShippingOptionsError**(): `Error` \| `undefined`

Returns an error if unable to load shipping options.

#### Returns

`Error` \| `undefined`

The error object if unable to load, otherwise undefined.

***

### getPickupOptionsError()

> **getPickupOptionsError**(): `Error` \| `undefined`

Returns an error if unable to fetch pickup options.

#### Returns

`Error` \| `undefined`

The error object if unable to fetch pickup options, otherwise undefined.

***

### getRemoveCouponError()

> **getRemoveCouponError**(): [`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

Returns an error if unable to remove a coupon code.

#### Returns

[`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

The error object if unable to remove, otherwise undefined.

***

### getRemoveGiftCertificateError()

> **getRemoveGiftCertificateError**(): [`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

Returns an error if unable to remove a gift certificate.

#### Returns

[`RequestError`](../classes/RequestError.md)\<`any`\> \| `undefined`

The error object if unable to remove, otherwise undefined.

***

### getSelectShippingOptionError()

> **getSelectShippingOptionError**(`consignmentId?`): `Error` \| `undefined`

Returns an error if unable to select a shipping option.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

#### Parameters

##### consignmentId?

`string`

The identifier of the consignment to be checked.

#### Returns

`Error` \| `undefined`

The error object if unable to select, otherwise undefined.

***

### getSignInEmailError()

> **getSignInEmailError**(): `Error` \| `undefined`

Returns an error if unable to send sign-in email.

#### Returns

`Error` \| `undefined`

The error object if unable to send email, otherwise undefined.

***

### getSignInError()

> **getSignInError**(): `Error` \| `undefined`

Returns an error if unable to sign in.

#### Returns

`Error` \| `undefined`

The error object if unable to sign in, otherwise undefined.

***

### getSignOutError()

> **getSignOutError**(): `Error` \| `undefined`

Returns an error if unable to sign out.

#### Returns

`Error` \| `undefined`

The error object if unable to sign out, otherwise undefined.

***

### getSubmitOrderError()

> **getSubmitOrderError**(): `Error` \| [`CartChangedError`](../classes/CartChangedError.md) \| [`CartConsistencyError`](../classes/CartConsistencyError.md) \| [`CartStockPositionsChangedError`](../classes/CartStockPositionsChangedError.md) \| `undefined`

Returns an error if unable to submit the current order.

#### Returns

`Error` \| [`CartChangedError`](../classes/CartChangedError.md) \| [`CartConsistencyError`](../classes/CartConsistencyError.md) \| [`CartStockPositionsChangedError`](../classes/CartStockPositionsChangedError.md) \| `undefined`

The error object if unable to submit, otherwise undefined.

***

### getUpdateBillingAddressError()

> **getUpdateBillingAddressError**(): `Error` \| `undefined`

Returns an error if unable to update billing address.

#### Returns

`Error` \| `undefined`

The error object if unable to update, otherwise undefined.

***

### getUpdateCheckoutError()

> **getUpdateCheckoutError**(): `Error` \| `undefined`

Returns an error if unable to update the current checkout.

#### Returns

`Error` \| `undefined`

The error object if unable to update, otherwise undefined.

***

### getUpdateConsignmentError()

> **getUpdateConsignmentError**(`consignmentId?`): `Error` \| `undefined`

Returns an error if unable to update a consignment.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

#### Parameters

##### consignmentId?

`string`

The identifier of the consignment to be checked.

#### Returns

`Error` \| `undefined`

The error object if unable to update, otherwise undefined.

***

### getUpdateShippingAddressError()

> **getUpdateShippingAddressError**(): `Error` \| `undefined`

Returns an error if unable to update shipping address.

#### Returns

`Error` \| `undefined`

The error object if unable to update, otherwise undefined.

***

### getUpdateSubscriptionsError()

> **getUpdateSubscriptionsError**(): `Error` \| `undefined`

Returns an error if unable to update subscriptions.

#### Returns

`Error` \| `undefined`

The error object if unable to update, otherwise undefined.
