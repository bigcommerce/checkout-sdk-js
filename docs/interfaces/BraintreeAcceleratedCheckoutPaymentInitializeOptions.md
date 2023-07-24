[@bigcommerce/checkout-sdk](../README.md) / BraintreeAcceleratedCheckoutPaymentInitializeOptions

# Interface: BraintreeAcceleratedCheckoutPaymentInitializeOptions

A set of options that are required to initialize the Braintree Accelerated Checkout payment
method for presenting on the page.

Also, Braintree requires specific options to initialize Braintree Accelerated Checkout Credit Card Component
```html
<!-- This is where the Braintree Credit Card Component will be inserted -->
<div id="container"></div>
```

```js
service.initializePayment({
    methodId: 'braintreeacceleratedcheckout',
    braintreeacceleratedcheckout: {
        container: '#container',
    },
});
```

## Table of contents

### Properties

- [container](BraintreeAcceleratedCheckoutPaymentInitializeOptions.md#container)

## Properties

### container

• **container**: `string`

The CSS selector of a container where the payment widget should be inserted into.
