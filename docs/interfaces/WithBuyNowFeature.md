[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / WithBuyNowFeature

# Interface: WithBuyNowFeature

## Extends

- `AmazonPayV2ButtonConfig`

## Properties

### buttonColor?

> `optional` **buttonColor?**: `AmazonPayV2ButtonColor`

Color of the Amazon Pay button.

#### Inherited from

`AmazonPayV2ButtonConfig.buttonColor`

***

### buyNowInitializeOptions?

> `optional` **buyNowInitializeOptions?**: `object`

The options that are required to initialize Buy Now functionality.

#### getBuyNowCartRequestBody()?

> `optional` **getBuyNowCartRequestBody**(): `void` \| `BuyNowCartRequestBody`

##### Returns

`void` \| `BuyNowCartRequestBody`

***

### checkoutLanguage?

> `optional` **checkoutLanguage?**: `AmazonPayV2CheckoutLanguage`

Language used to render the button and text on Amazon Pay hosted pages.

#### Inherited from

`AmazonPayV2ButtonConfig.checkoutLanguage`

***

### design?

> `optional` **design?**: `AmazonPayV2ButtonDesign`

Sets Amazon Pay button design.

#### Inherited from

`AmazonPayV2ButtonConfig.design`

***

### ledgerCurrency

> **ledgerCurrency**: `AmazonPayV2LedgerCurrency`

Ledger currency provided during registration for the given merchant identifier.

#### Inherited from

`AmazonPayV2ButtonConfig.ledgerCurrency`

***

### merchantId

> **merchantId**: `string`

Amazon Pay merchant account identifier.

#### Inherited from

`AmazonPayV2ButtonConfig.merchantId`

***

### placement

> **placement**: `AmazonPayV2Placement`

Placement of the Amazon Pay button on your website.

#### Inherited from

`AmazonPayV2ButtonConfig.placement`

***

### productType?

> `optional` **productType?**: `AmazonPayV2PayOptions`

Product type selected for checkout. Default is 'PayAndShip'.

#### Inherited from

`AmazonPayV2ButtonConfig.productType`

***

### sandbox?

> `optional` **sandbox?**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.

#### Inherited from

`AmazonPayV2ButtonConfig.sandbox`
