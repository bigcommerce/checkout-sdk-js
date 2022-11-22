[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / CreditCardInstrument

# Interface: CreditCardInstrument

[<internal>](../modules/internal_.md).CreditCardInstrument

## Table of contents

### Properties

- [browser\_info](internal_.CreditCardInstrument.md#browser_info)
- [ccCustomerCode](internal_.CreditCardInstrument.md#cccustomercode)
- [ccCvv](internal_.CreditCardInstrument.md#cccvv)
- [ccExpiry](internal_.CreditCardInstrument.md#ccexpiry)
- [ccName](internal_.CreditCardInstrument.md#ccname)
- [ccNumber](internal_.CreditCardInstrument.md#ccnumber)
- [extraData](internal_.CreditCardInstrument.md#extradata)
- [shouldSaveInstrument](internal_.CreditCardInstrument.md#shouldsaveinstrument)
- [shouldSetAsDefaultInstrument](internal_.CreditCardInstrument.md#shouldsetasdefaultinstrument)
- [threeDSecure](internal_.CreditCardInstrument.md#threedsecure)

## Properties

### browser\_info

• `Optional` **browser\_info**: [`BrowserInfo`](internal_.BrowserInfo.md)

___

### ccCustomerCode

• `Optional` **ccCustomerCode**: `string`

___

### ccCvv

• `Optional` **ccCvv**: `string`

___

### ccExpiry

• **ccExpiry**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `month` | `string` |
| `year` | `string` |

___

### ccName

• **ccName**: `string`

___

### ccNumber

• **ccNumber**: `string`

___

### extraData

• `Optional` **extraData**: `any`

___

### shouldSaveInstrument

• `Optional` **shouldSaveInstrument**: `boolean`

___

### shouldSetAsDefaultInstrument

• `Optional` **shouldSetAsDefaultInstrument**: `boolean`

___

### threeDSecure

• `Optional` **threeDSecure**: [`ThreeDSecure`](internal_.ThreeDSecure.md) \| [`ThreeDSecureToken`](internal_.ThreeDSecureToken.md)
