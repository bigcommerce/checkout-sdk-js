[@bigcommerce/checkout-sdk](../README.md) › [StripeUPEPaymentInitializeOptions](stripeupepaymentinitializeoptions.md)

# Interface: StripeUPEPaymentInitializeOptions

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

## Hierarchy

* **StripeUPEPaymentInitializeOptions**

## Index

### Properties

* [containerId](stripeupepaymentinitializeoptions.md#containerid)
* [style](stripeupepaymentinitializeoptions.md#optional-style)

### Methods

* [onError](stripeupepaymentinitializeoptions.md#optional-onerror)

## Properties

###  containerId

• **containerId**: *string*

The location to insert the credit card number form field.

___

### `Optional` style

• **style**? : *undefined | object*

Checkout styles from store theme

## Methods

### `Optional` onError

▸ **onError**(`error?`: [Error](amazonpaywidgeterror.md#error)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`error?` | [Error](amazonpaywidgeterror.md#error) |

**Returns:** *void*
