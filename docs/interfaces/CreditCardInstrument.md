[@bigcommerce/checkout-sdk](../README.md) / CreditCardInstrument

# Interface: CreditCardInstrument

## Table of contents

### Properties

- [browser_info](CreditCardInstrument.md#browser_info)
- [ccCustomerCode](CreditCardInstrument.md#cccustomercode)
- [ccCvv](CreditCardInstrument.md#cccvv)
- [ccExpiry](CreditCardInstrument.md#ccexpiry)
- [ccName](CreditCardInstrument.md#ccname)
- [ccNumber](CreditCardInstrument.md#ccnumber)
- [extraData](CreditCardInstrument.md#extradata)
- [shouldSaveInstrument](CreditCardInstrument.md#shouldsaveinstrument)
- [shouldSetAsDefaultInstrument](CreditCardInstrument.md#shouldsetasdefaultinstrument)
- [threeDSecure](CreditCardInstrument.md#threedsecure)

## Properties

### browser\_info

• `Optional` **browser\_info**: [`BrowserInfo`](BrowserInfo.md)

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

• `Optional` **threeDSecure**: [`ThreeDSecure`](ThreeDSecure.md) \| [`ThreeDSecureToken`](ThreeDSecureToken.md)
