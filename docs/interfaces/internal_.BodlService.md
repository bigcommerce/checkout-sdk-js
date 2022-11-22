[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / BodlService

# Interface: BodlService

[<internal>](../modules/internal_.md).BodlService

## Table of contents

### Methods

- [checkoutBegin](internal_.BodlService.md#checkoutbegin)
- [clickPayButton](internal_.BodlService.md#clickpaybutton)
- [customerEmailEntry](internal_.BodlService.md#customeremailentry)
- [customerPaymentMethodExecuted](internal_.BodlService.md#customerpaymentmethodexecuted)
- [customerSuggestionExecute](internal_.BodlService.md#customersuggestionexecute)
- [exitCheckout](internal_.BodlService.md#exitcheckout)
- [orderPurchased](internal_.BodlService.md#orderpurchased)
- [paymentComplete](internal_.BodlService.md#paymentcomplete)
- [paymentRejected](internal_.BodlService.md#paymentrejected)
- [selectedPaymentMethod](internal_.BodlService.md#selectedpaymentmethod)
- [showShippingMethods](internal_.BodlService.md#showshippingmethods)
- [stepCompleted](internal_.BodlService.md#stepcompleted)

## Methods

### checkoutBegin

▸ **checkoutBegin**(): `void`

#### Returns

`void`

___

### clickPayButton

▸ **clickPayButton**(`payload?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`BodlEventsPayload`](internal_.BodlEventsPayload.md) |

#### Returns

`void`

___

### customerEmailEntry

▸ **customerEmailEntry**(`email?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `email?` | `string` |

#### Returns

`void`

___

### customerPaymentMethodExecuted

▸ **customerPaymentMethodExecuted**(`payload?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`BodlEventsPayload`](internal_.BodlEventsPayload.md) |

#### Returns

`void`

___

### customerSuggestionExecute

▸ **customerSuggestionExecute**(): `void`

#### Returns

`void`

___

### exitCheckout

▸ **exitCheckout**(): `void`

#### Returns

`void`

___

### orderPurchased

▸ **orderPurchased**(): `void`

#### Returns

`void`

___

### paymentComplete

▸ **paymentComplete**(): `void`

#### Returns

`void`

___

### paymentRejected

▸ **paymentRejected**(): `void`

#### Returns

`void`

___

### selectedPaymentMethod

▸ **selectedPaymentMethod**(`methodName?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodName?` | `string` |

#### Returns

`void`

___

### showShippingMethods

▸ **showShippingMethods**(): `void`

#### Returns

`void`

___

### stepCompleted

▸ **stepCompleted**(`step?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `step?` | `string` |

#### Returns

`void`
