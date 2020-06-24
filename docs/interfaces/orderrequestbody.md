[@bigcommerce/checkout-sdk](../README.md) › [OrderRequestBody](orderrequestbody.md)

# Interface: OrderRequestBody

An object that contains the information required for submitting an order.

## Hierarchy

* **OrderRequestBody**

## Index

### Properties

* [payment](orderrequestbody.md#optional-payment)
* [useStoreCredit](orderrequestbody.md#optional-usestorecredit)

## Properties

### `Optional` payment

• **payment**? : *[OrderPaymentRequestBody](orderpaymentrequestbody.md)*

An object that contains the payment details of a customer. In some cases,
you can omit this object if the order does not require further payment.
For example, the customer is able to use their store credit to pay for
the entire order. Or they have already submitted their payment details
using PayPal.

___

### `Optional` useStoreCredit

• **useStoreCredit**? : *undefined | false | true*

If true, apply the store credit of the customer to the order. It only
works if the customer has previously signed in.
