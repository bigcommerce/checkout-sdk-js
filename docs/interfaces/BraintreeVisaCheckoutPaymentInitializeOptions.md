[@bigcommerce/checkout-sdk](../README.md) / BraintreeVisaCheckoutPaymentInitializeOptions

# Interface: BraintreeVisaCheckoutPaymentInitializeOptions

A set of options that are required to initialize the Visa Checkout payment
method provided by Braintree.

If the customer chooses to pay with Visa Checkout, they will be asked to
enter their payment details via a modal. You can hook into events emitted by
the modal by providing the callbacks listed below.

```js
service.initializePayment({
    methodId: 'braintreevisacheckout',
});
```

Additional event callbacks can be registered.

```js
service.initializePayment({
    methodId: 'braintreevisacheckout',
    braintreevisacheckout: {
        onError(error) {
            console.log(error);
        },
        onPaymentSelect() {
            console.log('Selected');
        },
    },
});
```

## Table of contents

### Methods

- [onError](BraintreeVisaCheckoutPaymentInitializeOptions.md#onerror)
- [onPaymentSelect](BraintreeVisaCheckoutPaymentInitializeOptions.md#onpaymentselect)

## Methods

### onError

▸ `Optional` **onError**(`error`): `void`

A callback that gets called when Visa Checkout fails to initialize or
selects a payment option.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `error` | `Error` | The error object describing the failure. |

#### Returns

`void`

___

### onPaymentSelect

▸ `Optional` **onPaymentSelect**(): `void`

A callback that gets called when the customer selects a payment option.

#### Returns

`void`
