[@bigcommerce/checkout-sdk](../README.md) / PaymentStrategySelector

# Interface: PaymentStrategySelector

## Table of contents

### Methods

- [getExecuteError](PaymentStrategySelector.md#getexecuteerror)
- [getFinalizeError](PaymentStrategySelector.md#getfinalizeerror)
- [getInitializeError](PaymentStrategySelector.md#getinitializeerror)
- [getWidgetInteractingError](PaymentStrategySelector.md#getwidgetinteractingerror)
- [isExecuting](PaymentStrategySelector.md#isexecuting)
- [isFinalizing](PaymentStrategySelector.md#isfinalizing)
- [isInitialized](PaymentStrategySelector.md#isinitialized)
- [isInitializing](PaymentStrategySelector.md#isinitializing)
- [isWidgetInteracting](PaymentStrategySelector.md#iswidgetinteracting)

## Methods

### getExecuteError

▸ **getExecuteError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getFinalizeError

▸ **getFinalizeError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getInitializeError

▸ **getInitializeError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getWidgetInteractingError

▸ **getWidgetInteractingError**(`methodId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### isExecuting

▸ **isExecuting**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`boolean`

___

### isFinalizing

▸ **isFinalizing**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`boolean`

___

### isInitialized

▸ **isInitialized**(`query`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`InitiaizedQuery`](InitiaizedQuery.md) |

#### Returns

`boolean`

___

### isInitializing

▸ **isInitializing**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`boolean`

___

### isWidgetInteracting

▸ **isWidgetInteracting**(`methodId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodId?` | `string` |

#### Returns

`boolean`
