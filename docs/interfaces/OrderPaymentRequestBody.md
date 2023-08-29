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

• `Optional` **paymentData**: [`CreditCardInstrument`](CreditCardInstrument.md) \| [`HostedInstrument`](HostedInstrument.md) \| [`VaultedInstrument`](VaultedInstrument.md) \| [`NonceInstrument`](NonceInstrument.md) \| `WithBankAccountInstrument` \| `Pick`<[`CreditCardInstrument`](CreditCardInstrument.md), ``"ccCustomerCode"`` \| ``"shouldSaveInstrument"`` \| ``"shouldSetAsDefaultInstrument"`` \| ``"extraData"`` \| ``"threeDSecure"`` \| ``"browser_info"``\> \| `Pick`<[`VaultedInstrument`](VaultedInstrument.md), ``"instrumentId"``\> \| `BlueSnapDirectEcpInstrument` \| `WithAccountCreation` \| [`CreditCardInstrument`](CreditCardInstrument.md) & [`WithDocumentInstrument`](WithDocumentInstrument.md) \| [`CreditCardInstrument`](CreditCardInstrument.md) & [`WithCheckoutcomFawryInstrument`](WithCheckoutcomFawryInstrument.md) \| [`CreditCardInstrument`](CreditCardInstrument.md) & [`WithCheckoutcomSEPAInstrument`](WithCheckoutcomSEPAInstrument.md) \| [`CreditCardInstrument`](CreditCardInstrument.md) & [`WithCheckoutcomiDealInstrument`](WithCheckoutcomiDealInstrument.md) \| [`HostedInstrument`](HostedInstrument.md) & [`WithMollieIssuerInstrument`](WithMollieIssuerInstrument.md)

An object that contains the details of a credit card, vaulted payment
instrument or nonce instrument.
