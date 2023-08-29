[@bigcommerce/checkout-sdk](../README.md) / OrderRequestBody

# Interface: OrderRequestBody

An object that contains the information required for submitting an order.

## Table of contents

### Properties

- [payment](OrderRequestBody.md#payment)
- [useStoreCredit](OrderRequestBody.md#usestorecredit)

## Properties

### payment

• `Optional` **payment**: [`OrderPaymentRequestBody`](OrderPaymentRequestBody.md)

An object that contains the payment details of a customer. In some cases,
you can omit this object if the order does not require further payment.
For example, the customer is able to use their store credit to pay for
the entire order. Or they have already submitted their payment details
using PayPal.

___

### useStoreCredit

• `Optional` **useStoreCredit**: `boolean`

If true, apply the store credit of the customer to the order. It only
works if the customer has previously signed in.
