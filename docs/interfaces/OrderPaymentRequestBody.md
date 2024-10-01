[@bigcommerce/checkout-sdk](../README.md) / OrderPaymentRequestBody

# Interface: OrderPaymentRequestBody

An object that contains the payment information required for submitting an
order.

## Table of contents

### Properties

- [gatewayId](OrderPaymentRequestBody.md#gatewayid)
- [methodId](OrderPaymentRequestBody.md#methodid)
- [paymentData](OrderPaymentRequestBody.md#paymentdata)

## Properties

### gatewayId

• `Optional` **gatewayId**: `string`

The identifier of the payment provider that is chosen for the order.

___

### methodId

• **methodId**: `string`

The identifier of the payment method that is chosen for the order.

___

### paymentData

• `Optional` **paymentData**: [`OrderPaymentInstrument`](../README.md#orderpaymentinstrument)

An object that contains the details of a credit card, vaulted payment
instrument or nonce instrument.
