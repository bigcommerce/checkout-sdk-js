[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / AdyenV3Action

# Interface: AdyenV3Action

## Properties

### method

> **method**: [`POST`](../enumerations/HTTPMethod.md#post)

***

### paymentData

> **paymentData**: `string`

Value that you need to submit in your /payments/details request when handling
the redirect.

***

### paymentMethodType

> **paymentMethodType**: [`AdyenPaymentMethodType`](../enumerations/AdyenPaymentMethodType.md)

***

### type

> **type**: [`AdyenV3ActionType`](../enumerations/AdyenV3ActionType.md)

***

### url

> **url**: `string`

The HTTP request method that you should use. After the shopper completes the payment,
they will be redirected back to your returnURL using the same method.
