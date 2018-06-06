[@bigcommerce/checkout-sdk](../README.md) > [OrderPaymentRequestBody](../interfaces/orderpaymentrequestbody.md)

# OrderPaymentRequestBody

An object that contains the payment information required for submitting an order.

## Hierarchy

**OrderPaymentRequestBody**

## Index

### Properties

* [gatewayId](orderpaymentrequestbody.md#gatewayid)
* [methodId](orderpaymentrequestbody.md#methodid)
* [paymentData](orderpaymentrequestbody.md#paymentdata)

---

## Properties

<a id="gatewayid"></a>

### `<Optional>` gatewayId

**● gatewayId**: * `undefined` &#124; `string`
*

The identifier of the payment provider that is chosen for the order.

___
<a id="methodid"></a>

###  methodId

**● methodId**: *`string`*

The identifier of the payment method that is chosen for the order.

___
<a id="paymentdata"></a>

### `<Optional>` paymentData

**● paymentData**: * [CreditCardInstrument](creditcardinstrument.md) &#124; [VaultedInstrument](vaultedinstrument.md)
*

An object that contains the details of a credit card or vaulted payment instrument.

___

