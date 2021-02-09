[@bigcommerce/checkout-sdk](../README.md) › [OrderPaymentRequestBody](orderpaymentrequestbody.md)

# Interface: OrderPaymentRequestBody

An object that contains the payment information required for submitting an
order.

## Hierarchy

* **OrderPaymentRequestBody**

## Index

### Properties

* [gatewayId](orderpaymentrequestbody.md#optional-gatewayid)
* [methodId](orderpaymentrequestbody.md#methodid)
* [paymentData](orderpaymentrequestbody.md#optional-paymentdata)

## Properties

### `Optional` gatewayId

• **gatewayId**? : *undefined | string*

The identifier of the payment provider that is chosen for the order.

___

###  methodId

• **methodId**: *string*

The identifier of the payment method that is chosen for the order.

___

### `Optional` paymentData

• **paymentData**? : *[CreditCardInstrument](creditcardinstrument.md) | [HostedInstrument](hostedinstrument.md) | [HostedCreditCardInstrument](../README.md#hostedcreditcardinstrument) | [HostedVaultedInstrument](../README.md#hostedvaultedinstrument) | [NonceInstrument](nonceinstrument.md) | [VaultedInstrument](vaultedinstrument.md) | [CreditCardInstrument](creditcardinstrument.md) & [WithDocumentInstrument](withdocumentinstrument.md)*

An object that contains the details of a credit card, vaulted payment
instrument or nonce instrument.
