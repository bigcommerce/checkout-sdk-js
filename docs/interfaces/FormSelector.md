[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / FormSelector

# Interface: FormSelector

## Methods

### getAddressExtraFields()

> **getAddressExtraFields**(): [`FormField`](FormField.md)[]

#### Returns

[`FormField`](FormField.md)[]

***

### getBillingAddressFields()

> **getBillingAddressFields**(`countries`, `countryCode`): [`FormField`](FormField.md)[]

#### Parameters

##### countries

[`Country`](Country.md)[] \| `undefined`

##### countryCode

`string`

#### Returns

[`FormField`](FormField.md)[]

***

### getCustomerAccountFields()

> **getCustomerAccountFields**(): [`FormField`](FormField.md)[]

#### Returns

[`FormField`](FormField.md)[]

***

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getOrderExtraFields()

> **getOrderExtraFields**(): [`FormField`](FormField.md)[]

#### Returns

[`FormField`](FormField.md)[]

***

### getShippingAddressFields()

> **getShippingAddressFields**(`countries`, `countryCode`): [`FormField`](FormField.md)[]

#### Parameters

##### countries

[`Country`](Country.md)[] \| `undefined`

##### countryCode

`string`

#### Returns

[`FormField`](FormField.md)[]

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`
