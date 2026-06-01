[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / OrderPaymentRequestBody

# Interface: OrderPaymentRequestBody

An object that contains the payment information required for submitting an
order.

## Properties

### gatewayId?

> `optional` **gatewayId?**: `string`

The identifier of the payment provider that is chosen for the order.

***

### methodId

> **methodId**: `string`

The identifier of the payment method that is chosen for the order.

***

### paymentData?

> `optional` **paymentData?**: [`OrderPaymentInstrument`](../type-aliases/OrderPaymentInstrument.md)

An object that contains the details of a credit card, vaulted payment
instrument or nonce instrument.
