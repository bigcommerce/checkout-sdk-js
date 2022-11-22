[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / PhysicalItem

# Interface: PhysicalItem

[<internal>](../modules/internal_.md).PhysicalItem

## Hierarchy

- [`LineItem`](internal_.LineItem.md)

  ↳ **`PhysicalItem`**

## Table of contents

### Properties

- [addedByPromotion](internal_.PhysicalItem.md#addedbypromotion)
- [brand](internal_.PhysicalItem.md#brand)
- [categories](internal_.PhysicalItem.md#categories)
- [categoryNames](internal_.PhysicalItem.md#categorynames)
- [comparisonPrice](internal_.PhysicalItem.md#comparisonprice)
- [couponAmount](internal_.PhysicalItem.md#couponamount)
- [discountAmount](internal_.PhysicalItem.md#discountamount)
- [discounts](internal_.PhysicalItem.md#discounts)
- [extendedComparisonPrice](internal_.PhysicalItem.md#extendedcomparisonprice)
- [extendedListPrice](internal_.PhysicalItem.md#extendedlistprice)
- [extendedSalePrice](internal_.PhysicalItem.md#extendedsaleprice)
- [giftWrapping](internal_.PhysicalItem.md#giftwrapping)
- [id](internal_.PhysicalItem.md#id)
- [imageUrl](internal_.PhysicalItem.md#imageurl)
- [isShippingRequired](internal_.PhysicalItem.md#isshippingrequired)
- [isTaxable](internal_.PhysicalItem.md#istaxable)
- [listPrice](internal_.PhysicalItem.md#listprice)
- [name](internal_.PhysicalItem.md#name)
- [options](internal_.PhysicalItem.md#options)
- [parentId](internal_.PhysicalItem.md#parentid)
- [productId](internal_.PhysicalItem.md#productid)
- [quantity](internal_.PhysicalItem.md#quantity)
- [salePrice](internal_.PhysicalItem.md#saleprice)
- [sku](internal_.PhysicalItem.md#sku)
- [socialMedia](internal_.PhysicalItem.md#socialmedia)
- [url](internal_.PhysicalItem.md#url)
- [variantId](internal_.PhysicalItem.md#variantid)

## Properties

### addedByPromotion

• **addedByPromotion**: `boolean`

#### Inherited from

[LineItem](internal_.LineItem.md).[addedByPromotion](internal_.LineItem.md#addedbypromotion)

___

### brand

• **brand**: `string`

#### Inherited from

[LineItem](internal_.LineItem.md).[brand](internal_.LineItem.md#brand)

___

### categories

• `Optional` **categories**: [`LineItemCategory`](internal_.LineItemCategory.md)[][]

#### Inherited from

[LineItem](internal_.LineItem.md).[categories](internal_.LineItem.md#categories)

___

### categoryNames

• `Optional` **categoryNames**: `string`[]

#### Inherited from

[LineItem](internal_.LineItem.md).[categoryNames](internal_.LineItem.md#categorynames)

___

### comparisonPrice

• **comparisonPrice**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[comparisonPrice](internal_.LineItem.md#comparisonprice)

___

### couponAmount

• **couponAmount**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[couponAmount](internal_.LineItem.md#couponamount)

___

### discountAmount

• **discountAmount**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[discountAmount](internal_.LineItem.md#discountamount)

___

### discounts

• **discounts**: { `discountedAmount`: `number` ; `name`: `string`  }[]

#### Inherited from

[LineItem](internal_.LineItem.md).[discounts](internal_.LineItem.md#discounts)

___

### extendedComparisonPrice

• **extendedComparisonPrice**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[extendedComparisonPrice](internal_.LineItem.md#extendedcomparisonprice)

___

### extendedListPrice

• **extendedListPrice**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[extendedListPrice](internal_.LineItem.md#extendedlistprice)

___

### extendedSalePrice

• **extendedSalePrice**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[extendedSalePrice](internal_.LineItem.md#extendedsaleprice)

___

### giftWrapping

• `Optional` **giftWrapping**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `number` |
| `message` | `string` |
| `name` | `string` |

___

### id

• **id**: `string` \| `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[id](internal_.LineItem.md#id)

___

### imageUrl

• **imageUrl**: `string`

#### Inherited from

[LineItem](internal_.LineItem.md).[imageUrl](internal_.LineItem.md#imageurl)

___

### isShippingRequired

• **isShippingRequired**: `boolean`

___

### isTaxable

• **isTaxable**: `boolean`

#### Inherited from

[LineItem](internal_.LineItem.md).[isTaxable](internal_.LineItem.md#istaxable)

___

### listPrice

• **listPrice**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[listPrice](internal_.LineItem.md#listprice)

___

### name

• **name**: `string`

#### Inherited from

[LineItem](internal_.LineItem.md).[name](internal_.LineItem.md#name)

___

### options

• `Optional` **options**: [`LineItemOption`](internal_.LineItemOption.md)[]

#### Inherited from

[LineItem](internal_.LineItem.md).[options](internal_.LineItem.md#options)

___

### parentId

• `Optional` **parentId**: ``null`` \| `string`

#### Inherited from

[LineItem](internal_.LineItem.md).[parentId](internal_.LineItem.md#parentid)

___

### productId

• **productId**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[productId](internal_.LineItem.md#productid)

___

### quantity

• **quantity**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[quantity](internal_.LineItem.md#quantity)

___

### salePrice

• **salePrice**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[salePrice](internal_.LineItem.md#saleprice)

___

### sku

• **sku**: `string`

#### Inherited from

[LineItem](internal_.LineItem.md).[sku](internal_.LineItem.md#sku)

___

### socialMedia

• `Optional` **socialMedia**: [`LineItemSocialData`](internal_.LineItemSocialData.md)[]

#### Inherited from

[LineItem](internal_.LineItem.md).[socialMedia](internal_.LineItem.md#socialmedia)

___

### url

• **url**: `string`

#### Inherited from

[LineItem](internal_.LineItem.md).[url](internal_.LineItem.md#url)

___

### variantId

• **variantId**: `number`

#### Inherited from

[LineItem](internal_.LineItem.md).[variantId](internal_.LineItem.md#variantid)
