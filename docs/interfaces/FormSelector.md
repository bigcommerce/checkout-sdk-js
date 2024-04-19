[@bigcommerce/checkout-sdk](../README.md) / FormSelector

# Interface: FormSelector

## Table of contents

### Methods

- [getBillingAddressFields](FormSelector.md#getbillingaddressfields)
- [getCustomerAccountFields](FormSelector.md#getcustomeraccountfields)
- [getLoadError](FormSelector.md#getloaderror)
- [getShippingAddressFields](FormSelector.md#getshippingaddressfields)
- [isLoading](FormSelector.md#isloading)

## Methods

### getBillingAddressFields

▸ **getBillingAddressFields**(`countries`, `countryCode`): [`FormField`](FormField.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `countries` | `undefined` \| [`Country`](Country.md)[] |
| `countryCode` | `string` |

#### Returns

[`FormField`](FormField.md)[]

___

### getCustomerAccountFields

▸ **getCustomerAccountFields**(): [`FormField`](FormField.md)[]

#### Returns

[`FormField`](FormField.md)[]

___

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getShippingAddressFields

▸ **getShippingAddressFields**(`countries`, `countryCode`): [`FormField`](FormField.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `countries` | `undefined` \| [`Country`](Country.md)[] |
| `countryCode` | `string` |

#### Returns

[`FormField`](FormField.md)[]

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`
