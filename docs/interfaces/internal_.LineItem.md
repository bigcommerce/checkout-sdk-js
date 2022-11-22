[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / LineItem

# Interface: LineItem

[<internal>](../modules/internal_.md).LineItem

## Hierarchy

- **`LineItem`**

  ↳ [`PhysicalItem`](internal_.PhysicalItem.md)

  ↳ [`DigitalItem`](internal_.DigitalItem.md)

## Table of contents

### Properties

- [addedByPromotion](internal_.LineItem.md#addedbypromotion)
- [brand](internal_.LineItem.md#brand)
- [categories](internal_.LineItem.md#categories)
- [categoryNames](internal_.LineItem.md#categorynames)
- [comparisonPrice](internal_.LineItem.md#comparisonprice)
- [couponAmount](internal_.LineItem.md#couponamount)
- [discountAmount](internal_.LineItem.md#discountamount)
- [discounts](internal_.LineItem.md#discounts)
- [extendedComparisonPrice](internal_.LineItem.md#extendedcomparisonprice)
- [extendedListPrice](internal_.LineItem.md#extendedlistprice)
- [extendedSalePrice](internal_.LineItem.md#extendedsaleprice)
- [id](internal_.LineItem.md#id)
- [imageUrl](internal_.LineItem.md#imageurl)
- [isTaxable](internal_.LineItem.md#istaxable)
- [listPrice](internal_.LineItem.md#listprice)
- [name](internal_.LineItem.md#name)
- [options](internal_.LineItem.md#options)
- [parentId](internal_.LineItem.md#parentid)
- [productId](internal_.LineItem.md#productid)
- [quantity](internal_.LineItem.md#quantity)
- [salePrice](internal_.LineItem.md#saleprice)
- [sku](internal_.LineItem.md#sku)
- [socialMedia](internal_.LineItem.md#socialmedia)
- [url](internal_.LineItem.md#url)
- [variantId](internal_.LineItem.md#variantid)

## Properties

### addedByPromotion

• **addedByPromotion**: `boolean`

___

### brand

• **brand**: `string`

___

### categories

• `Optional` **categories**: [`LineItemCategory`](internal_.LineItemCategory.md)[][]

___

### categoryNames

• `Optional` **categoryNames**: `string`[]

___

### comparisonPrice

• **comparisonPrice**: `number`

___

### couponAmount

• **couponAmount**: `number`

___

### discountAmount

• **discountAmount**: `number`

___

### discounts

• **discounts**: { `discountedAmount`: `number` ; `name`: `string`  }[]

___

### extendedComparisonPrice

• **extendedComparisonPrice**: `number`

___

### extendedListPrice

• **extendedListPrice**: `number`

___

### extendedSalePrice

• **extendedSalePrice**: `number`

___

### id

• **id**: `string` \| `number`

___

### imageUrl

• **imageUrl**: `string`

___

### isTaxable

• **isTaxable**: `boolean`

___

### listPrice

• **listPrice**: `number`

___

### name

• **name**: `string`

___

### options

• `Optional` **options**: [`LineItemOption`](internal_.LineItemOption.md)[]

___

### parentId

• `Optional` **parentId**: ``null`` \| `string`

___

### productId

• **productId**: `number`

___

### quantity

• **quantity**: `number`

___

### salePrice

• **salePrice**: `number`

___

### sku

• **sku**: `string`

___

### socialMedia

• `Optional` **socialMedia**: [`LineItemSocialData`](internal_.LineItemSocialData.md)[]

___

### url

• **url**: `string`

___

### variantId

• **variantId**: `number`
