[@bigcommerce/checkout-sdk](../README.md) / BodlService

# Interface: BodlService

## Table of contents

### Methods

- [checkoutBegin](BodlService.md#checkoutbegin)
- [clickPayButton](BodlService.md#clickpaybutton)
- [customerEmailEntry](BodlService.md#customeremailentry)
- [customerPaymentMethodExecuted](BodlService.md#customerpaymentmethodexecuted)
- [customerSuggestionExecute](BodlService.md#customersuggestionexecute)
- [customerSuggestionInit](BodlService.md#customersuggestioninit)
- [exitCheckout](BodlService.md#exitcheckout)
- [orderPurchased](BodlService.md#orderpurchased)
- [paymentComplete](BodlService.md#paymentcomplete)
- [paymentRejected](BodlService.md#paymentrejected)
- [selectedPaymentMethod](BodlService.md#selectedpaymentmethod)
- [showShippingMethods](BodlService.md#showshippingmethods)
- [stepCompleted](BodlService.md#stepcompleted)

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
| `payload?` | [`BodlEventsPayload`](BodlEventsPayload.md) |

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
| `payload?` | [`BodlEventsPayload`](BodlEventsPayload.md) |

#### Returns

`void`

___

### customerSuggestionExecute

▸ **customerSuggestionExecute**(): `void`

#### Returns

`void`

___

### customerSuggestionInit

▸ **customerSuggestionInit**(`payload?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload?` | [`BodlEventsPayload`](BodlEventsPayload.md) |

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
