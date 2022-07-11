[@bigcommerce/checkout-sdk](../README.md) / LineItem

# Interface: LineItem

## Hierarchy

- **`LineItem`**

  ↳ [`DigitalItem`](DigitalItem.md)

  ↳ [`PhysicalItem`](PhysicalItem.md)

## Table of contents

### Properties

- [addedByPromotion](LineItem.md#addedbypromotion)
- [brand](LineItem.md#brand)
- [categories](LineItem.md#categories)
- [categoryNames](LineItem.md#categorynames)
- [comparisonPrice](LineItem.md#comparisonprice)
- [couponAmount](LineItem.md#couponamount)
- [discountAmount](LineItem.md#discountamount)
- [discounts](LineItem.md#discounts)
- [extendedComparisonPrice](LineItem.md#extendedcomparisonprice)
- [extendedListPrice](LineItem.md#extendedlistprice)
- [extendedSalePrice](LineItem.md#extendedsaleprice)
- [id](LineItem.md#id)
- [imageUrl](LineItem.md#imageurl)
- [isTaxable](LineItem.md#istaxable)
- [listPrice](LineItem.md#listprice)
- [name](LineItem.md#name)
- [options](LineItem.md#options)
- [parentId](LineItem.md#parentid)
- [productId](LineItem.md#productid)
- [quantity](LineItem.md#quantity)
- [salePrice](LineItem.md#saleprice)
- [sku](LineItem.md#sku)
- [socialMedia](LineItem.md#socialmedia)
- [url](LineItem.md#url)
- [variantId](LineItem.md#variantid)

## Properties

### addedByPromotion

• **addedByPromotion**: `boolean`

___

### brand

• **brand**: `string`

___

### categories

• `Optional` **categories**: [`LineItemCategory`](LineItemCategory.md)[][]

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

• `Optional` **options**: [`LineItemOption`](LineItemOption.md)[]

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

• `Optional` **socialMedia**: [`LineItemSocialData`](LineItemSocialData.md)[]

___

### url

• **url**: `string`

___

### variantId

• **variantId**: `number`
