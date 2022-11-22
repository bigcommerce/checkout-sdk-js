[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StripeUPEPaymentInitializeOptions

# Interface: StripeUPEPaymentInitializeOptions

[<internal>](../modules/internal_.md).StripeUPEPaymentInitializeOptions

A set of options that are required to initialize the Stripe payment method.

Once Stripe payment is initialized, credit card form fields, provided by the
payment provider as iframes, will be inserted into the current page. These
options provide a location and styling for each of the form fields.

```html
<!-- This is where the credit card component will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'stripeupe',
    stripeupe {
        containerId: 'container',
    },
});
```

## Table of contents

### Properties

- [containerId](internal_.StripeUPEPaymentInitializeOptions.md#containerid)
- [style](internal_.StripeUPEPaymentInitializeOptions.md#style)

### Methods

- [onError](internal_.StripeUPEPaymentInitializeOptions.md#onerror)

## Properties

### containerId

• **containerId**: `string`

The location to insert the credit card number form field.

___

### style

• `Optional` **style**: `Object`

Checkout styles from store theme

#### Index signature

▪ [key: `string`]: `string`

## Methods

### onError

▸ `Optional` **onError**(`error?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `error?` | `Error` |

#### Returns

`void`
