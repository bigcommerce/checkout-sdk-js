[@bigcommerce/checkout-sdk](../README.md) › [CheckoutStoreErrorSelector](checkoutstoreerrorselector.md)

# Interface: CheckoutStoreErrorSelector

Responsible for getting the error of any asynchronous checkout action, if
there is any.

This object has a set of getters that would return an error if an action is
not executed successfully. For example, if you are unable to submit an order,
you can use this object to retrieve the reason for the failure.

## Hierarchy

* **CheckoutStoreErrorSelector**

## Index

### Methods

* [getApplyCouponError](checkoutstoreerrorselector.md#getapplycouponerror)
* [getApplyGiftCertificateError](checkoutstoreerrorselector.md#getapplygiftcertificateerror)
* [getApplyStoreCreditError](checkoutstoreerrorselector.md#getapplystorecrediterror)
* [getContinueAsGuestError](checkoutstoreerrorselector.md#getcontinueasguesterror)
* [getCreateConsignmentsError](checkoutstoreerrorselector.md#getcreateconsignmentserror)
* [getCreateCustomerAccountError](checkoutstoreerrorselector.md#getcreatecustomeraccounterror)
* [getDeleteConsignmentError](checkoutstoreerrorselector.md#getdeleteconsignmenterror)
* [getDeleteInstrumentError](checkoutstoreerrorselector.md#getdeleteinstrumenterror)
* [getError](checkoutstoreerrorselector.md#geterror)
* [getFinalizeOrderError](checkoutstoreerrorselector.md#getfinalizeordererror)
* [getInitializeCustomerError](checkoutstoreerrorselector.md#getinitializecustomererror)
* [getInitializePaymentError](checkoutstoreerrorselector.md#getinitializepaymenterror)
* [getInitializeShippingError](checkoutstoreerrorselector.md#getinitializeshippingerror)
* [getLoadBillingCountriesError](checkoutstoreerrorselector.md#getloadbillingcountrieserror)
* [getLoadCartError](checkoutstoreerrorselector.md#getloadcarterror)
* [getLoadCheckoutError](checkoutstoreerrorselector.md#getloadcheckouterror)
* [getLoadConfigError](checkoutstoreerrorselector.md#getloadconfigerror)
* [getLoadInstrumentsError](checkoutstoreerrorselector.md#getloadinstrumentserror)
* [getLoadOrderError](checkoutstoreerrorselector.md#getloadordererror)
* [getLoadPaymentMethodError](checkoutstoreerrorselector.md#getloadpaymentmethoderror)
* [getLoadPaymentMethodsError](checkoutstoreerrorselector.md#getloadpaymentmethodserror)
* [getLoadShippingCountriesError](checkoutstoreerrorselector.md#getloadshippingcountrieserror)
* [getLoadShippingOptionsError](checkoutstoreerrorselector.md#getloadshippingoptionserror)
* [getRemoveCouponError](checkoutstoreerrorselector.md#getremovecouponerror)
* [getRemoveGiftCertificateError](checkoutstoreerrorselector.md#getremovegiftcertificateerror)
* [getSelectShippingOptionError](checkoutstoreerrorselector.md#getselectshippingoptionerror)
* [getSignInEmailError](checkoutstoreerrorselector.md#getsigninemailerror)
* [getSignInError](checkoutstoreerrorselector.md#getsigninerror)
* [getSignOutError](checkoutstoreerrorselector.md#getsignouterror)
* [getSubmitOrderError](checkoutstoreerrorselector.md#getsubmitordererror)
* [getUpdateBillingAddressError](checkoutstoreerrorselector.md#getupdatebillingaddresserror)
* [getUpdateCheckoutError](checkoutstoreerrorselector.md#getupdatecheckouterror)
* [getUpdateConsignmentError](checkoutstoreerrorselector.md#getupdateconsignmenterror)
* [getUpdateShippingAddressError](checkoutstoreerrorselector.md#getupdateshippingaddresserror)
* [getUpdateSubscriptionsError](checkoutstoreerrorselector.md#getupdatesubscriptionserror)

## Methods

###  getApplyCouponError

▸ **getApplyCouponError**(): *[RequestError](../classes/requesterror.md) | undefined*

Returns an error if unable to apply a coupon code.

**Returns:** *[RequestError](../classes/requesterror.md) | undefined*

The error object if unable to apply, otherwise undefined.

___

###  getApplyGiftCertificateError

▸ **getApplyGiftCertificateError**(): *[RequestError](../classes/requesterror.md) | undefined*

Returns an error if unable to apply a gift certificate.

**Returns:** *[RequestError](../classes/requesterror.md) | undefined*

The error object if unable to apply, otherwise undefined.

___

###  getApplyStoreCreditError

▸ **getApplyStoreCreditError**(): *[RequestError](../classes/requesterror.md) | undefined*

Returns an error if unable to apply store credit.

**Returns:** *[RequestError](../classes/requesterror.md) | undefined*

The error object if unable to apply, otherwise undefined.

___

###  getContinueAsGuestError

▸ **getContinueAsGuestError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to continue as guest.

The call could fail in scenarios where guest checkout is not allowed, for example, when existing accounts are required to sign-in.

In the background, this call tries to set the billing address email using the Storefront API. You could access the Storefront API response status code using `getContinueAsGuestError` error selector.

```js
console.log(state.errors.getContinueAsGuestError());
console.log(state.errors.getContinueAsGuestError().status);
```

For more information about status codes, check [Checkout Storefront API - Add Checkout Billing Address](https://developer.bigcommerce.com/api-reference/cart-checkout/storefront-checkout-api/checkout-billing-address/checkoutsbillingaddressbycheckoutidpost).

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to continue, otherwise undefined.

___

###  getCreateConsignmentsError

▸ **getCreateConsignmentsError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to create consignments.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to create, otherwise undefined.

___

###  getCreateCustomerAccountError

▸ **getCreateCustomerAccountError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to create customer account.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to create account, otherwise undefined.

___

###  getDeleteConsignmentError

▸ **getDeleteConsignmentError**(`consignmentId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to delete a consignment.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`consignmentId?` | undefined &#124; string | The identifier of the consignment to be checked. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to delete, otherwise undefined.

___

###  getDeleteInstrumentError

▸ **getDeleteInstrumentError**(`instrumentId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to delete a payment instrument.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`instrumentId?` | undefined &#124; string | The identifier of the payment instrument to delete. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to delete, otherwise undefined.

___

###  getError

▸ **getError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

___

###  getFinalizeOrderError

▸ **getFinalizeOrderError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to finalize the current order.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to finalize, otherwise undefined.

___

###  getInitializeCustomerError

▸ **getInitializeCustomerError**(`methodId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to initialize the customer step of a checkout
process.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`methodId?` | undefined &#124; string | The identifer of the initialization method to execute. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to initialize, otherwise undefined.

___

###  getInitializePaymentError

▸ **getInitializePaymentError**(`methodId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to initialize a specific payment method.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`methodId?` | undefined &#124; string | The identifier of the payment method to initialize. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to initialize, otherwise undefined.

___

###  getInitializeShippingError

▸ **getInitializeShippingError**(`methodId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to initialize the shipping step of a checkout
process.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`methodId?` | undefined &#124; string | The identifer of the initialization method to execute. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to initialize, otherwise undefined.

___

###  getLoadBillingCountriesError

▸ **getLoadBillingCountriesError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load billing countries.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadCartError

▸ **getLoadCartError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load the current cart.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadCheckoutError

▸ **getLoadCheckoutError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load the current checkout.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadConfigError

▸ **getLoadConfigError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load the checkout configuration of a store.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadInstrumentsError

▸ **getLoadInstrumentsError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load payment instruments.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadOrderError

▸ **getLoadOrderError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load the current order.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadPaymentMethodError

▸ **getLoadPaymentMethodError**(`methodId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load a specific payment method.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`methodId?` | undefined &#124; string | The identifier of the payment method to load. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadPaymentMethodsError

▸ **getLoadPaymentMethodsError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load payment methods.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadShippingCountriesError

▸ **getLoadShippingCountriesError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load shipping countries.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getLoadShippingOptionsError

▸ **getLoadShippingOptionsError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to load shipping options.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to load, otherwise undefined.

___

###  getRemoveCouponError

▸ **getRemoveCouponError**(): *[RequestError](../classes/requesterror.md) | undefined*

Returns an error if unable to remove a coupon code.

**Returns:** *[RequestError](../classes/requesterror.md) | undefined*

The error object if unable to remove, otherwise undefined.

___

###  getRemoveGiftCertificateError

▸ **getRemoveGiftCertificateError**(): *[RequestError](../classes/requesterror.md) | undefined*

Returns an error if unable to remove a gift certificate.

**Returns:** *[RequestError](../classes/requesterror.md) | undefined*

The error object if unable to remove, otherwise undefined.

___

###  getSelectShippingOptionError

▸ **getSelectShippingOptionError**(`consignmentId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to select a shipping option.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`consignmentId?` | undefined &#124; string | The identifier of the consignment to be checked. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to select, otherwise undefined.

___

###  getSignInEmailError

▸ **getSignInEmailError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to send sign-in email.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to send email, otherwise undefined.

___

###  getSignInError

▸ **getSignInError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to sign in.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to sign in, otherwise undefined.

___

###  getSignOutError

▸ **getSignOutError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to sign out.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to sign out, otherwise undefined.

___

###  getSubmitOrderError

▸ **getSubmitOrderError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to submit the current order.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to submit, otherwise undefined.

___

###  getUpdateBillingAddressError

▸ **getUpdateBillingAddressError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to update billing address.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to update, otherwise undefined.

___

###  getUpdateCheckoutError

▸ **getUpdateCheckoutError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to update the current checkout.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to update, otherwise undefined.

___

###  getUpdateConsignmentError

▸ **getUpdateConsignmentError**(`consignmentId?`: undefined | string): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to update a consignment.

A consignment ID should be provided when checking for an error for a
specific consignment, otherwise it will check for all available consignments.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`consignmentId?` | undefined &#124; string | The identifier of the consignment to be checked. |

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to update, otherwise undefined.

___

###  getUpdateShippingAddressError

▸ **getUpdateShippingAddressError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to update shipping address.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to update, otherwise undefined.

___

###  getUpdateSubscriptionsError

▸ **getUpdateSubscriptionsError**(): *[Error](amazonpaywidgeterror.md#error) | undefined*

Returns an error if unable to update subscriptions.

**Returns:** *[Error](amazonpaywidgeterror.md#error) | undefined*

The error object if unable to update, otherwise undefined.
