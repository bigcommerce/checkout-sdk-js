[@bigcommerce/checkout-sdk](../README.md) / ConsignmentSelector

# Interface: ConsignmentSelector

## Table of contents

### Methods

- [getConsignmentByAddress](ConsignmentSelector.md#getconsignmentbyaddress)
- [getConsignmentById](ConsignmentSelector.md#getconsignmentbyid)
- [getConsignments](ConsignmentSelector.md#getconsignments)
- [getConsignmentsOrThrow](ConsignmentSelector.md#getconsignmentsorthrow)
- [getCreateError](ConsignmentSelector.md#getcreateerror)
- [getDeleteError](ConsignmentSelector.md#getdeleteerror)
- [getItemAssignmentError](ConsignmentSelector.md#getitemassignmenterror)
- [getLoadError](ConsignmentSelector.md#getloaderror)
- [getLoadShippingOptionsError](ConsignmentSelector.md#getloadshippingoptionserror)
- [getShippingOption](ConsignmentSelector.md#getshippingoption)
- [getUnassignedItems](ConsignmentSelector.md#getunassigneditems)
- [getUpdateError](ConsignmentSelector.md#getupdateerror)
- [getUpdateShippingOptionError](ConsignmentSelector.md#getupdateshippingoptionerror)
- [isAssigningItems](ConsignmentSelector.md#isassigningitems)
- [isCreating](ConsignmentSelector.md#iscreating)
- [isDeleting](ConsignmentSelector.md#isdeleting)
- [isLoading](ConsignmentSelector.md#isloading)
- [isLoadingShippingOptions](ConsignmentSelector.md#isloadingshippingoptions)
- [isUpdating](ConsignmentSelector.md#isupdating)
- [isUpdatingShippingOption](ConsignmentSelector.md#isupdatingshippingoption)

## Methods

### getConsignmentByAddress

▸ **getConsignmentByAddress**(`address`): `undefined` \| [`Consignment`](Consignment.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`AddressRequestBody`](AddressRequestBody.md) |

#### Returns

`undefined` \| [`Consignment`](Consignment.md)

___

### getConsignmentById

▸ **getConsignmentById**(`id`): `undefined` \| [`Consignment`](Consignment.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`undefined` \| [`Consignment`](Consignment.md)

___

### getConsignments

▸ **getConsignments**(): `undefined` \| [`Consignment`](Consignment.md)[]

#### Returns

`undefined` \| [`Consignment`](Consignment.md)[]

___

### getConsignmentsOrThrow

▸ **getConsignmentsOrThrow**(): [`Consignment`](Consignment.md)[]

#### Returns

[`Consignment`](Consignment.md)[]

___

### getCreateError

▸ **getCreateError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getDeleteError

▸ **getDeleteError**(`consignmentId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getItemAssignmentError

▸ **getItemAssignmentError**(`address`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`AddressRequestBody`](AddressRequestBody.md) |

#### Returns

`undefined` \| `Error`

___

### getLoadError

▸ **getLoadError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getLoadShippingOptionsError

▸ **getLoadShippingOptionsError**(): `undefined` \| `Error`

#### Returns

`undefined` \| `Error`

___

### getShippingOption

▸ **getShippingOption**(): `undefined` \| [`ShippingOption`](ShippingOption.md)

#### Returns

`undefined` \| [`ShippingOption`](ShippingOption.md)

___

### getUnassignedItems

▸ **getUnassignedItems**(): [`PhysicalItem`](PhysicalItem.md)[]

#### Returns

[`PhysicalItem`](PhysicalItem.md)[]

___

### getUpdateError

▸ **getUpdateError**(`consignmentId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### getUpdateShippingOptionError

▸ **getUpdateShippingOptionError**(`consignmentId?`): `undefined` \| `Error`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId?` | `string` |

#### Returns

`undefined` \| `Error`

___

### isAssigningItems

▸ **isAssigningItems**(`address`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | [`AddressRequestBody`](AddressRequestBody.md) |

#### Returns

`boolean`

___

### isCreating

▸ **isCreating**(): `boolean`

#### Returns

`boolean`

___

### isDeleting

▸ **isDeleting**(`consignmentId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId?` | `string` |

#### Returns

`boolean`

___

### isLoading

▸ **isLoading**(): `boolean`

#### Returns

`boolean`

___

### isLoadingShippingOptions

▸ **isLoadingShippingOptions**(): `boolean`

#### Returns

`boolean`

___

### isUpdating

▸ **isUpdating**(`consignmentId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId?` | `string` |

#### Returns

`boolean`

___

### isUpdatingShippingOption

▸ **isUpdatingShippingOption**(`consignmentId?`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignmentId?` | `string` |

#### Returns

`boolean`
