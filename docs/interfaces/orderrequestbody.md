[@bigcommerce/checkout-sdk](../README.md) > [OrderRequestBody](../interfaces/orderrequestbody.md)

# OrderRequestBody

An object that contains the information required for submitting an order.

## Hierarchy

**OrderRequestBody**

## Index

### Properties

* [payment](orderrequestbody.md#payment)
* [useStoreCredit](orderrequestbody.md#usestorecredit)

---

## Properties

<a id="payment"></a>

### `<Optional>` payment

**● payment**: *[OrderPaymentRequestBody](orderpaymentrequestbody.md)*

An object that contains the payment details of a customer. In some cases, you can omit this object if the order does not require further payment. For example, the customer is able to use their store credit to pay for the entire order. Or they have already submitted thier payment details using PayPal.

___
<a id="usestorecredit"></a>

### `<Optional>` useStoreCredit

**● useStoreCredit**: * `undefined` &#124; `false` &#124; `true`
*

If true, apply the store credit of the customer to the order. It only works if the customer has previously signed in.

___

