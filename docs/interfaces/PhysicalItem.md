[@bigcommerce/checkout-sdk](../README.md) / PhysicalItem

# Interface: PhysicalItem

## Hierarchy

- [`LineItem`](LineItem.md)

  ↳ **`PhysicalItem`**

## Table of contents

### Properties

- [addedByPromotion](PhysicalItem.md#addedbypromotion)
- [backorderMessage](PhysicalItem.md#backordermessage)
- [brand](PhysicalItem.md#brand)
- [categories](PhysicalItem.md#categories)
- [categoryNames](PhysicalItem.md#categorynames)
- [comparisonPrice](PhysicalItem.md#comparisonprice)
- [couponAmount](PhysicalItem.md#couponamount)
- [discountAmount](PhysicalItem.md#discountamount)
- [discounts](PhysicalItem.md#discounts)
- [extendedComparisonPrice](PhysicalItem.md#extendedcomparisonprice)
- [extendedListPrice](PhysicalItem.md#extendedlistprice)
- [extendedSalePrice](PhysicalItem.md#extendedsaleprice)
- [giftWrapping](PhysicalItem.md#giftwrapping)
- [id](PhysicalItem.md#id)
- [imageUrl](PhysicalItem.md#imageurl)
- [isShippingRequired](PhysicalItem.md#isshippingrequired)
- [isTaxable](PhysicalItem.md#istaxable)
- [listPrice](PhysicalItem.md#listprice)
- [name](PhysicalItem.md#name)
- [options](PhysicalItem.md#options)
- [parentId](PhysicalItem.md#parentid)
- [productId](PhysicalItem.md#productid)
- [quantity](PhysicalItem.md#quantity)
- [quantityBackordered](PhysicalItem.md#quantitybackordered)
- [retailPrice](PhysicalItem.md#retailprice)
- [salePrice](PhysicalItem.md#saleprice)
- [sku](PhysicalItem.md#sku)
- [socialMedia](PhysicalItem.md#socialmedia)
- [stockPosition](PhysicalItem.md#stockposition)
- [url](PhysicalItem.md#url)
- [variantId](PhysicalItem.md#variantid)

## Properties

### addedByPromotion

• **addedByPromotion**: `boolean`

#### Inherited from

[LineItem](LineItem.md).[addedByPromotion](LineItem.md#addedbypromotion)

___

### backorderMessage

• `Optional` **backorderMessage**: ``null`` \| `string`

#### Inherited from

[LineItem](LineItem.md).[backorderMessage](LineItem.md#backordermessage)

___

### brand

• **brand**: `string`

#### Inherited from

[LineItem](LineItem.md).[brand](LineItem.md#brand)

___

### categories

• `Optional` **categories**: [`LineItemCategory`](LineItemCategory.md)[][]

#### Inherited from

[LineItem](LineItem.md).[categories](LineItem.md#categories)

___

### categoryNames

• `Optional` **categoryNames**: `string`[]

#### Inherited from

[LineItem](LineItem.md).[categoryNames](LineItem.md#categorynames)

___

### comparisonPrice

• **comparisonPrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[comparisonPrice](LineItem.md#comparisonprice)

___

### couponAmount

• **couponAmount**: `number`

#### Inherited from

[LineItem](LineItem.md).[couponAmount](LineItem.md#couponamount)

___

### discountAmount

• **discountAmount**: `number`

#### Inherited from

[LineItem](LineItem.md).[discountAmount](LineItem.md#discountamount)

___

### discounts

• **discounts**: { `discountedAmount`: `number` ; `name`: `string`  }[]

#### Inherited from

[LineItem](LineItem.md).[discounts](LineItem.md#discounts)

___

### extendedComparisonPrice

• **extendedComparisonPrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[extendedComparisonPrice](LineItem.md#extendedcomparisonprice)

___

### extendedListPrice

• **extendedListPrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[extendedListPrice](LineItem.md#extendedlistprice)

___

### extendedSalePrice

• **extendedSalePrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[extendedSalePrice](LineItem.md#extendedsaleprice)

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

[LineItem](LineItem.md).[id](LineItem.md#id)

___

### imageUrl

• **imageUrl**: `string`

#### Inherited from

[LineItem](LineItem.md).[imageUrl](LineItem.md#imageurl)

___

### isShippingRequired

• **isShippingRequired**: `boolean`

___

### isTaxable

• **isTaxable**: `boolean`

#### Inherited from

[LineItem](LineItem.md).[isTaxable](LineItem.md#istaxable)

___

### listPrice

• **listPrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[listPrice](LineItem.md#listprice)

___

### name

• **name**: `string`

#### Inherited from

[LineItem](LineItem.md).[name](LineItem.md#name)

___

### options

• `Optional` **options**: [`LineItemOption`](LineItemOption.md)[]

#### Inherited from

[LineItem](LineItem.md).[options](LineItem.md#options)

___

### parentId

• `Optional` **parentId**: ``null`` \| `string`

#### Inherited from

[LineItem](LineItem.md).[parentId](LineItem.md#parentid)

___

### productId

• **productId**: `number`

#### Inherited from

[LineItem](LineItem.md).[productId](LineItem.md#productid)

___

### quantity

• **quantity**: `number`

#### Inherited from

[LineItem](LineItem.md).[quantity](LineItem.md#quantity)

___

### quantityBackordered

• `Optional` **quantityBackordered**: `number`

#### Inherited from

[LineItem](LineItem.md).[quantityBackordered](LineItem.md#quantitybackordered)

___

### retailPrice

• **retailPrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[retailPrice](LineItem.md#retailprice)

___

### salePrice

• **salePrice**: `number`

#### Inherited from

[LineItem](LineItem.md).[salePrice](LineItem.md#saleprice)

___

### sku

• **sku**: `string`

#### Inherited from

[LineItem](LineItem.md).[sku](LineItem.md#sku)

___

### socialMedia

• `Optional` **socialMedia**: [`LineItemSocialData`](LineItemSocialData.md)[]

#### Inherited from

[LineItem](LineItem.md).[socialMedia](LineItem.md#socialmedia)

___

### stockPosition

• `Optional` **stockPosition**: [`StockPosition`](StockPosition.md)

#### Inherited from

[LineItem](LineItem.md).[stockPosition](LineItem.md#stockposition)

___

### url

• **url**: `string`

#### Inherited from

[LineItem](LineItem.md).[url](LineItem.md#url)

___

### variantId

• **variantId**: `number`

#### Inherited from

[LineItem](LineItem.md).[variantId](LineItem.md#variantid)
