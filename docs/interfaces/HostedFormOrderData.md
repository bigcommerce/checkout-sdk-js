[@bigcommerce/checkout-sdk](../README.md) / HostedFormOrderData

# Interface: HostedFormOrderData

## Table of contents

### Properties

- [additionalAction](HostedFormOrderData.md#additionalaction)
- [authToken](HostedFormOrderData.md#authtoken)
- [checkout](HostedFormOrderData.md#checkout)
- [config](HostedFormOrderData.md#config)
- [order](HostedFormOrderData.md#order)
- [orderMeta](HostedFormOrderData.md#ordermeta)
- [payment](HostedFormOrderData.md#payment)
- [paymentMethod](HostedFormOrderData.md#paymentmethod)
- [paymentMethodMeta](HostedFormOrderData.md#paymentmethodmeta)

## Properties

### additionalAction

• `Optional` **additionalAction**: [`PaymentAdditionalAction`](PaymentAdditionalAction.md)

___

### authToken

• **authToken**: `string`

___

### checkout

• `Optional` **checkout**: [`Checkout`](Checkout.md)

___

### config

• `Optional` **config**: [`Config`](Config.md)

___

### order

• `Optional` **order**: [`Order`](Order.md)

___

### orderMeta

• `Optional` **orderMeta**: [`OrderMetaState`](OrderMetaState.md)

___

### payment

• `Optional` **payment**: `Pick`<[`CreditCardInstrument`](CreditCardInstrument.md), ``"ccCustomerCode"`` \| ``"shouldSaveInstrument"`` \| ``"shouldSetAsDefaultInstrument"`` \| ``"extraData"`` \| ``"threeDSecure"`` \| ``"browser_info"``\> & [`PaymentInstrumentMeta`](PaymentInstrumentMeta.md) \| `Pick`<[`VaultedInstrument`](VaultedInstrument.md), ``"instrumentId"``\> & [`PaymentInstrumentMeta`](PaymentInstrumentMeta.md)

___

### paymentMethod

• `Optional` **paymentMethod**: [`PaymentMethod`](PaymentMethod.md)<`any`\>

___

### paymentMethodMeta

• `Optional` **paymentMethodMeta**: [`PaymentMethodMeta`](PaymentMethodMeta.md)
