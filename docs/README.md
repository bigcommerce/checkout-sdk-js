@bigcommerce/checkout-sdk

# @bigcommerce/checkout-sdk

## Table of contents

### Classes

- [CacheKeyResolver](classes/CacheKeyResolver.md)

### Functions

- [mapToInternalAddress](README.md#maptointernaladdress)
- [mapToInternalCart](README.md#maptointernalcart)
- [mapToInternalCoupon](README.md#maptointernalcoupon)
- [mapToInternalCustomer](README.md#maptointernalcustomer)
- [mapToInternalGiftCertificate](README.md#maptointernalgiftcertificate)
- [mapToInternalLineItem](README.md#maptointernallineitem)
- [mapToInternalLineItems](README.md#maptointernallineitems)
- [mapToInternalOrder](README.md#maptointernalorder)
- [mapToInternalQuote](README.md#maptointernalquote)
- [mapToInternalShippingOption](README.md#maptointernalshippingoption)
- [mapToInternalShippingOptions](README.md#maptointernalshippingoptions)

## Functions

### mapToInternalAddress

▸ **mapToInternalAddress**(`address`, `consignments?`): `InternalAddress`<`any`\>

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `Address` \| `BillingAddress` |
| `consignments?` | `Consignment`[] |

#### Returns

`InternalAddress`<`any`\>

___

### mapToInternalCart

▸ **mapToInternalCart**(`checkout`): `InternalCart`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `checkout` | `Checkout` |

#### Returns

`InternalCart`

___

### mapToInternalCoupon

▸ **mapToInternalCoupon**(`coupon`): `InternalCoupon`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `coupon` | `Coupon` |

#### Returns

`InternalCoupon`

___

### mapToInternalCustomer

▸ **mapToInternalCustomer**(`customer`, `billingAddress`): `InternalCustomer`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `customer` | `Customer` |
| `billingAddress` | `BillingAddress` |

#### Returns

`InternalCustomer`

___

### mapToInternalGiftCertificate

▸ **mapToInternalGiftCertificate**(`giftCertificate`): `InternalGiftCertificate`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `giftCertificate` | `GiftCertificate` |

#### Returns

`InternalGiftCertificate`

___

### mapToInternalLineItem

▸ **mapToInternalLineItem**(`item`, `type`, `decimalPlaces`, `idKey?`): `InternalLineItem`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `item` | `LineItem` |
| `type` | `string` |
| `decimalPlaces` | `number` |
| `idKey?` | ``"id"`` \| ``"variantId"`` \| ``"productId"`` \| ``"sku"`` \| ``"name"`` \| ``"url"`` \| ``"quantity"`` \| ``"brand"`` \| ``"categoryNames"`` \| ``"categories"`` \| ``"isTaxable"`` \| ``"imageUrl"`` \| ``"discounts"`` \| ``"discountAmount"`` \| ``"couponAmount"`` \| ``"listPrice"`` \| ``"salePrice"`` \| ``"comparisonPrice"`` \| ``"extendedListPrice"`` \| ``"extendedSalePrice"`` \| ``"extendedComparisonPrice"`` \| ``"socialMedia"`` \| ``"options"`` \| ``"addedByPromotion"`` \| ``"parentId"`` |

#### Returns

`InternalLineItem`

___

### mapToInternalLineItems

▸ **mapToInternalLineItems**(`itemMap`, `decimalPlaces`, `idKey?`): `InternalLineItem`[]

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `itemMap` | `LineItemMap` |
| `decimalPlaces` | `number` |
| `idKey?` | ``"id"`` \| ``"variantId"`` \| ``"productId"`` \| ``"sku"`` \| ``"name"`` \| ``"url"`` \| ``"quantity"`` \| ``"brand"`` \| ``"categoryNames"`` \| ``"categories"`` \| ``"isTaxable"`` \| ``"imageUrl"`` \| ``"discounts"`` \| ``"discountAmount"`` \| ``"couponAmount"`` \| ``"listPrice"`` \| ``"salePrice"`` \| ``"comparisonPrice"`` \| ``"extendedListPrice"`` \| ``"extendedSalePrice"`` \| ``"extendedComparisonPrice"`` \| ``"socialMedia"`` \| ``"options"`` \| ``"addedByPromotion"`` \| ``"parentId"`` |

#### Returns

`InternalLineItem`[]

___

### mapToInternalOrder

▸ **mapToInternalOrder**(`order`, `orderMeta?`): `InternalOrder`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `order` | `Order` |
| `orderMeta?` | `OrderMetaState` |

#### Returns

`InternalOrder`

___

### mapToInternalQuote

▸ **mapToInternalQuote**(`checkout`, `shippingAddress?`): `InternalQuote`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `checkout` | `Checkout` |
| `shippingAddress?` | `Address` |

#### Returns

`InternalQuote`

___

### mapToInternalShippingOption

▸ **mapToInternalShippingOption**(`option`, `isSelected`): `InternalShippingOption`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `option` | `ShippingOption` |
| `isSelected` | `boolean` |

#### Returns

`InternalShippingOption`

___

### mapToInternalShippingOptions

▸ **mapToInternalShippingOptions**(`consignments`): `InternalShippingOptionList`

**`deprecated`** This mapper is only for internal use only. It is required during
the transition period as we are moving to adopt the new storefront API object
schema.

#### Parameters

| Name | Type |
| :------ | :------ |
| `consignments` | `Consignment`[] |

#### Returns

`InternalShippingOptionList`
