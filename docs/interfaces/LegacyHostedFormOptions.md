[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / LegacyHostedFormOptions

# Interface: LegacyHostedFormOptions

## Properties

### fields

> **fields**: [`HostedFieldOptionsMap`](../type-aliases/HostedFieldOptionsMap.md)

***

### styles?

> `optional` **styles?**: [`HostedFieldStylesMap`](HostedFieldStylesMap.md)

## Methods

### onBlur()?

> `optional` **onBlur**(`data`): `void`

#### Parameters

##### data

###### errors?

`Partial`\<`Record`\<[`HostedFormErrorDataKeys`](../type-aliases/HostedFormErrorDataKeys.md), [`HostedFormErrorData`](HostedFormErrorData.md)\>\>

###### fieldType

[`HostedFieldType`](../enumerations/HostedFieldType.md)

#### Returns

`void`

***

### onCardTypeChange()?

> `optional` **onCardTypeChange**(`data`): `void`

#### Parameters

##### data

###### cardType?

`string`

#### Returns

`void`

***

### onEnter()?

> `optional` **onEnter**(`data`): `void`

#### Parameters

##### data

###### fieldType

[`HostedFieldType`](../enumerations/HostedFieldType.md)

#### Returns

`void`

***

### onFocus()?

> `optional` **onFocus**(`data`): `void`

#### Parameters

##### data

###### fieldType

[`HostedFieldType`](../enumerations/HostedFieldType.md)

#### Returns

`void`

***

### onValidate()?

> `optional` **onValidate**(`data`): `void`

#### Parameters

##### data

[`HostedInputValidateResults`](HostedInputValidateResults.md)

#### Returns

`void`
