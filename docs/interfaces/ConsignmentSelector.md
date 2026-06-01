[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / ConsignmentSelector

# Interface: ConsignmentSelector

## Methods

### getConsignmentByAddress()

> **getConsignmentByAddress**(`address`): [`Consignment`](Consignment.md) \| `undefined`

#### Parameters

##### address

[`AddressRequestBody`](AddressRequestBody.md)

#### Returns

[`Consignment`](Consignment.md) \| `undefined`

***

### getConsignmentById()

> **getConsignmentById**(`id`): [`Consignment`](Consignment.md) \| `undefined`

#### Parameters

##### id

`string`

#### Returns

[`Consignment`](Consignment.md) \| `undefined`

***

### getConsignments()

> **getConsignments**(): [`Consignment`](Consignment.md)[] \| `undefined`

#### Returns

[`Consignment`](Consignment.md)[] \| `undefined`

***

### getConsignmentsOrThrow()

> **getConsignmentsOrThrow**(): [`Consignment`](Consignment.md)[]

#### Returns

[`Consignment`](Consignment.md)[]

***

### getCreateError()

> **getCreateError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getDeleteError()

> **getDeleteError**(`consignmentId?`): `Error` \| `undefined`

#### Parameters

##### consignmentId?

`string`

#### Returns

`Error` \| `undefined`

***

### getItemAssignmentError()

> **getItemAssignmentError**(`address`): `Error` \| `undefined`

#### Parameters

##### address

[`AddressRequestBody`](AddressRequestBody.md)

#### Returns

`Error` \| `undefined`

***

### getLoadError()

> **getLoadError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getLoadShippingOptionsError()

> **getLoadShippingOptionsError**(): `Error` \| `undefined`

#### Returns

`Error` \| `undefined`

***

### getShippingOption()

> **getShippingOption**(): [`ShippingOption`](ShippingOption.md) \| `undefined`

#### Returns

[`ShippingOption`](ShippingOption.md) \| `undefined`

***

### getUnassignedItems()

> **getUnassignedItems**(): [`PhysicalItem`](PhysicalItem.md)[]

#### Returns

[`PhysicalItem`](PhysicalItem.md)[]

***

### getUpdateError()

> **getUpdateError**(`consignmentId?`): `Error` \| `undefined`

#### Parameters

##### consignmentId?

`string`

#### Returns

`Error` \| `undefined`

***

### getUpdateShippingOptionError()

> **getUpdateShippingOptionError**(`consignmentId?`): `Error` \| `undefined`

#### Parameters

##### consignmentId?

`string`

#### Returns

`Error` \| `undefined`

***

### isAssigningItems()

> **isAssigningItems**(`address`): `boolean`

#### Parameters

##### address

[`AddressRequestBody`](AddressRequestBody.md)

#### Returns

`boolean`

***

### isCreating()

> **isCreating**(): `boolean`

#### Returns

`boolean`

***

### isDeleting()

> **isDeleting**(`consignmentId?`): `boolean`

#### Parameters

##### consignmentId?

`string`

#### Returns

`boolean`

***

### isLoading()

> **isLoading**(): `boolean`

#### Returns

`boolean`

***

### isLoadingShippingOptions()

> **isLoadingShippingOptions**(): `boolean`

#### Returns

`boolean`

***

### isUpdating()

> **isUpdating**(`consignmentId?`): `boolean`

#### Parameters

##### consignmentId?

`string`

#### Returns

`boolean`

***

### isUpdatingShippingOption()

> **isUpdatingShippingOption**(`consignmentId?`): `boolean`

#### Parameters

##### consignmentId?

`string`

#### Returns

`boolean`
