[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / OrderPaymentRequestBody

# Interface: OrderPaymentRequestBody

[<internal>](../modules/internal_.md).OrderPaymentRequestBody

An object that contains the payment information required for submitting an
order.

## Table of contents

### Properties

- [gatewayId](internal_.OrderPaymentRequestBody.md#gatewayid)
- [methodId](internal_.OrderPaymentRequestBody.md#methodid)
- [paymentData](internal_.OrderPaymentRequestBody.md#paymentdata)

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

• `Optional` **paymentData**: [`OrderPaymentInstrument`](../modules/internal_.md#orderpaymentinstrument)

An object that contains the details of a credit card, vaulted payment
instrument or nonce instrument.
