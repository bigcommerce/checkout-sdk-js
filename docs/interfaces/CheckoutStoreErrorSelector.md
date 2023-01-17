[@bigcommerce/checkout-sdk](../README.md) / CheckoutStoreErrorSelector

# Interface: CheckoutStoreErrorSelector

Responsible for getting the error of any asynchronous checkout action, if
there is any.

This object has a set of getters that would return an error if an action is
not executed successfully. For example, if you are unable to submit an order,
you can use this object to retrieve the reason for the failure.

## Table of contents

### Methods

- [getApplyCouponError](CheckoutStoreErrorSelector.md#getapplycouponerror)
- [getApplyGiftCertificateError](CheckoutStoreErrorSelector.md#getapplygiftcertificateerror)
- [getApplyStoreCreditError](CheckoutStoreErrorSelector.md#getapplystorecrediterror)
- [getContinueAsGuestError](CheckoutStoreErrorSelector.md#getcontinueasguesterror)
- [getCreateConsignmentsError](CheckoutStoreErrorSelector.md#getcreateconsignmentserror)
- [getCreateCustomerAccountError](CheckoutStoreErrorSelector.md#getcreatecustomeraccounterror)
- [getCreateCustomerAddressError](CheckoutStoreErrorSelector.md#getcreatecustomeraddresserror)
- [getDeleteConsignmentError](CheckoutStoreErrorSelector.md#getdeleteconsignmenterror)
- [getDeleteInstrumentError](CheckoutStoreErrorSelector.md#getdeleteinstrumenterror)
- [getError](CheckoutStoreErrorSelector.md#geterror)
- [getFinalizeOrderError](CheckoutStoreErrorSelector.md#getfinalizeordererror)
- [getInitializeCustomerError](CheckoutStoreErrorSelector.md#getinitializecustomererror)
- [getInitializePaymentError](CheckoutStoreErrorSelector.md#getinitializepaymenterror)
- [getInitializeShippingError](CheckoutStoreErrorSelector.md#getinitializeshippingerror)
- [getLoadBillingCountriesError](CheckoutStoreErrorSelector.md#getloadbillingcountrieserror)
- [getLoadCartError](CheckoutStoreErrorSelector.md#getloadcarterror)
- [getLoadCheckoutError](CheckoutStoreErrorSelector.md#getloadcheckouterror)
- [getLoadConfigError](CheckoutStoreErrorSelector.md#getloadconfigerror)
- [getLoadInstrumentsError](CheckoutStoreErrorSelector.md#getloadinstrumentserror)
- [getLoadOrderError](CheckoutStoreErrorSelector.md#getloadordererror)
- [getLoadPaymentMethodError](CheckoutStoreErrorSelector.md#getloadpaymentmethoderror)
- [getLoadPaymentMethodsError](CheckoutStoreErrorSelector.md#getloadpaymentmethodserror)
- [getLoadShippingCountriesError](CheckoutStoreErrorSelector.md#getloadshippingcountrieserror)
- [getLoadShippingOptionsError](CheckoutStoreErrorSelector.md#getloadshippingoptionserror)
- [getPickupOptionsError](CheckoutStoreErrorSelector.md#getpickupoptionserror)
- [getRemoveCouponError](CheckoutStoreErrorSelector.md#getremovecouponerror)
- [getRemoveGiftCertificateError](CheckoutStoreErrorSelector.md#getremovegiftcertificateerror)
- [getSelectShippingOptionError](CheckoutStoreErrorSelector.md#getselectshippingoptionerror)
- [getSignInEmailError](CheckoutStoreErrorSelector.md#getsigninemailerror)
- [getSignInError](CheckoutStoreErrorSelector.md#getsigninerror)
- [getSignOutError](CheckoutStoreErrorSelector.md#getsignouterror)
- [getSubmitOrderError](CheckoutStoreErrorSelector.md#getsubmitordererror)
- [getUpdateBillingAddressError](CheckoutStoreErrorSelector.md#getupdatebillingaddresserror)
- [getUpdateCheckoutError](CheckoutStoreErrorSelector.md#getupdatecheckouterror)
- [getUpdateConsignmentError](CheckoutStoreErrorSelector.md#getupdateconsignmenterror)
- [getUpdateShippingAddressError](CheckoutStoreErrorSelector.md#getupdateshippingaddresserror)
- [getUpdateSubscriptionsError](CheckoutStoreErrorSelector.md#getupdatesubscriptionserror)

## Methods

### getApplyCouponError

▸ **getApplyCouponError**(): `undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

Returns an error if unable to apply a coupon code.

#### Returns

`undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

The error object if unable to apply, otherwise undefined.

___

### getApplyGiftCertificateError

▸ **getApplyGiftCertificateError**(): `undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

Returns an error if unable to apply a gift certificate.

#### Returns

`undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

The error object if unable to apply, otherwise undefined.

___

### getApplyStoreCreditError

▸ **getApplyStoreCreditError**(): `undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

Returns an error if unable to apply store credit.

#### Returns

`undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

The error object if unable to apply, otherwise undefined.

___

### getContinueAsGuestError

▸ **getContinueAsGuestError**(): `undefined` \| `Error`

Returns an error if unable to continue as guest.

The call could fail in scenarios where guest checkout is not allowed, for example, when existing accounts are required to sign-in.

In the background, this call tries to set the billing address email using the Storefront API. You could access the Storefront API response status code using `getContinueAsGuestError` error selector.

```js
console.log(state.errors.getContinueAsGuestError());
console.log(state.errors.getContinueAsGuestError().status);
```

For more information about status codes, check [Checkout Storefront API - Add Checkout Billing Address](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-checkout-api/checkout-billing-address/checkoutsbillingaddressbycheckoutidpost).

#### Returns

`undefined` \| `Error`

The error object if unable to continue, otherwise undefined.

___

### getCreateConsignmentsError

▸ **getCreateConsignmentsError**(): `undefined` \| `Error`

Returns an error if unable to create consignments.

#### Returns

`undefined` \| `Error`

The error object if unable to create, otherwise undefined.

___

### getCreateCustomerAccountError

▸ **getCreateCustomerAccountError**(): `undefined` \| `Error`

Returns an error if unable to create customer account.

#### Returns

`undefined` \| `Error`

The error object if unable to create account, otherwise undefined.

___

### getCreateCustomerAddressError

▸ **getCreateCustomerAddressError**(): `undefined` \| `Error`

Returns an error if unable to create customer address.

#### Returns

`undefined` \| `Error`

The error object if unable to create address, otherwise undefined.

___

### getDeleteConsignmentError

▸ **getDeleteConsignmentError**(`consignmentId?`): `undefined` \| `Error`

Returns an error if unable to delete a consignment.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `consignmentId?` | `string` | The identifier of the consignment to be checked. |

#### Returns

`undefined` \| `Error`

The error object if unable to delete, otherwise undefined.

___

### getDeleteInstrumentError

▸ **getDeleteInstrumentError**(`instrumentId?`): `undefined` \| `Error`

Returns an error if unable to delete a payment instrument.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `instrumentId?` | `string` | The identifier of the payment instrument to delete. |

#### Returns

`undefined` \| `Error`

The error object if unable to delete, otherwise undefined.

___

### getError

▸ **getError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getFinalizeOrderError

▸ **getFinalizeOrderError**(): `undefined` \| `Error`

Returns an error if unable to finalize the current order.

#### Returns

`undefined` \| `Error`

The error object if unable to finalize, otherwise undefined.

___

### getInitializeCustomerError

▸ **getInitializeCustomerError**(`methodId?`): `undefined` \| `Error`

Returns an error if unable to initialize the customer step of a checkout
process.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `methodId?` | `string` | The identifer of the initialization method to execute. |

#### Returns

`undefined` \| `Error`

The error object if unable to initialize, otherwise undefined.

___

### getInitializePaymentError

▸ **getInitializePaymentError**(`methodId?`): `undefined` \| `Error`

Returns an error if unable to initialize a specific payment method.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `methodId?` | `string` | The identifier of the payment method to initialize. |

#### Returns

`undefined` \| `Error`

The error object if unable to initialize, otherwise undefined.

___

### getInitializeShippingError

▸ **getInitializeShippingError**(`methodId?`): `undefined` \| `Error`

Returns an error if unable to initialize the shipping step of a checkout
process.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `methodId?` | `string` | The identifer of the initialization method to execute. |

#### Returns

`undefined` \| `Error`

The error object if unable to initialize, otherwise undefined.

___

### getLoadBillingCountriesError

▸ **getLoadBillingCountriesError**(): `undefined` \| `Error`

Returns an error if unable to load billing countries.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadCartError

▸ **getLoadCartError**(): `undefined` \| `Error`

Returns an error if unable to load the current cart.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadCheckoutError

▸ **getLoadCheckoutError**(): `undefined` \| `Error`

Returns an error if unable to load the current checkout.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadConfigError

▸ **getLoadConfigError**(): `undefined` \| `Error`

Returns an error if unable to load the checkout configuration of a store.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadInstrumentsError

▸ **getLoadInstrumentsError**(): `undefined` \| `Error`

Returns an error if unable to load payment instruments.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadOrderError

▸ **getLoadOrderError**(): `undefined` \| `Error`

Returns an error if unable to load the current order.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadPaymentMethodError

▸ **getLoadPaymentMethodError**(`methodId?`): `undefined` \| `Error`

Returns an error if unable to load a specific payment method.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `methodId?` | `string` | The identifier of the payment method to load. |

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadPaymentMethodsError

▸ **getLoadPaymentMethodsError**(): `undefined` \| `Error`

Returns an error if unable to load payment methods.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadShippingCountriesError

▸ **getLoadShippingCountriesError**(): `undefined` \| `Error`

Returns an error if unable to load shipping countries.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getLoadShippingOptionsError

▸ **getLoadShippingOptionsError**(): `undefined` \| `Error`

Returns an error if unable to load shipping options.

#### Returns

`undefined` \| `Error`

The error object if unable to load, otherwise undefined.

___

### getPickupOptionsError

▸ **getPickupOptionsError**(): `undefined` \| `Error`

Returns an error if unable to fetch pickup options.

#### Returns

`undefined` \| `Error`

The error object if unable to fetch pickup options, otherwise undefined.

___

### getRemoveCouponError

▸ **getRemoveCouponError**(): `undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

Returns an error if unable to remove a coupon code.

#### Returns

`undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

The error object if unable to remove, otherwise undefined.

___

### getRemoveGiftCertificateError

▸ **getRemoveGiftCertificateError**(): `undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

Returns an error if unable to remove a gift certificate.

#### Returns

`undefined` \| [`RequestError`](../classes/RequestError.md)<`any`\>

The error object if unable to remove, otherwise undefined.

___

### getSelectShippingOptionError

▸ **getSelectShippingOptionError**(`consignmentId?`): `undefined` \| `Error`

Returns an error if unable to select a shipping option.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `consignmentId?` | `string` | The identifier of the consignment to be checked. |

#### Returns

`undefined` \| `Error`

The error object if unable to select, otherwise undefined.

___

### getSignInEmailError

▸ **getSignInEmailError**(): `undefined` \| `Error`

Returns an error if unable to send sign-in email.

#### Returns

`undefined` \| `Error`

The error object if unable to send email, otherwise undefined.

___

### getSignInError

▸ **getSignInError**(): `undefined` \| `Error`

Returns an error if unable to sign in.

#### Returns

`undefined` \| `Error`

The error object if unable to sign in, otherwise undefined.

___

### getSignOutError

▸ **getSignOutError**(): `undefined` \| `Error`

Returns an error if unable to sign out.

#### Returns

`undefined` \| `Error`

The error object if unable to sign out, otherwise undefined.

___

### getSubmitOrderError

▸ **getSubmitOrderError**(): `undefined` \| `Error` \| [`CartChangedError`](../classes/CartChangedError.md) \| [`CartConsistencyError`](../classes/CartConsistencyError.md)

Returns an error if unable to submit the current order.

#### Returns

`undefined` \| `Error` \| [`CartChangedError`](../classes/CartChangedError.md) \| [`CartConsistencyError`](../classes/CartConsistencyError.md)

The error object if unable to submit, otherwise undefined.

___

### getUpdateBillingAddressError

▸ **getUpdateBillingAddressError**(): `undefined` \| `Error`

Returns an error if unable to update billing address.

#### Returns

`undefined` \| `Error`

The error object if unable to update, otherwise undefined.

___

### getUpdateCheckoutError

▸ **getUpdateCheckoutError**(): `undefined` \| `Error`

Returns an error if unable to update the current checkout.

#### Returns

`undefined` \| `Error`

The error object if unable to update, otherwise undefined.

___

### getUpdateConsignmentError

▸ **getUpdateConsignmentError**(`consignmentId?`): `undefined` \| `Error`

Returns an error if unable to update a consignment.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `consignmentId?` | `string` | The identifier of the consignment to be checked. |

#### Returns

`undefined` \| `Error`

The error object if unable to update, otherwise undefined.

___

### getUpdateShippingAddressError

▸ **getUpdateShippingAddressError**(): `undefined` \| `Error`

Returns an error if unable to update shipping address.

#### Returns

`undefined` \| `Error`

The error object if unable to update, otherwise undefined.

___

### getUpdateSubscriptionsError

▸ **getUpdateSubscriptionsError**(): `undefined` \| `Error`

Returns an error if unable to update subscriptions.

#### Returns

`undefined` \| `Error`

The error object if unable to update, otherwise undefined.
