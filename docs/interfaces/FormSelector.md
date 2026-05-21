[@bigcommerce/checkout-sdk](../README.md) / FormSelector

# Interface: FormSelector

## Table of contents

### Methods

- [getAddressExtraFields](FormSelector.md#getaddressextrafields)
- [getBillingAddressFields](FormSelector.md#getbillingaddressfields)
- [getCustomerAccountFields](FormSelector.md#getcustomeraccountfields)
- [getLoadError](FormSelector.md#getloaderror)
- [getOrderExtraFields](FormSelector.md#getorderextrafields)
- [getShippingAddressFields](FormSelector.md#getshippingaddressfields)
- [isLoading](FormSelector.md#isloading)

## Methods

### getAddressExtraFields

▸ **getAddressExtraFields**(): [`FormField`](FormField.md)[]

#### Returns

[`FormField`](FormField.md)[]

___

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

### getOrderExtraFields

▸ **getOrderExtraFields**(): [`FormField`](FormField.md)[]

#### Returns

[`FormField`](FormField.md)[]

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
