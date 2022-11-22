[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayV2ButtonParams

# Interface: AmazonPayV2ButtonParams

[<internal>](../modules/internal_.md).AmazonPayV2ButtonParams

## Hierarchy

- [`AmazonPayV2ButtonConfig`](internal_.AmazonPayV2ButtonConfig.md)

  ↳ **`AmazonPayV2ButtonParams`**

## Table of contents

### Properties

- [buttonColor](internal_.AmazonPayV2ButtonParams.md#buttoncolor)
- [checkoutLanguage](internal_.AmazonPayV2ButtonParams.md#checkoutlanguage)
- [createCheckoutSession](internal_.AmazonPayV2ButtonParams.md#createcheckoutsession)
- [ledgerCurrency](internal_.AmazonPayV2ButtonParams.md#ledgercurrency)
- [merchantId](internal_.AmazonPayV2ButtonParams.md#merchantid)
- [placement](internal_.AmazonPayV2ButtonParams.md#placement)
- [productType](internal_.AmazonPayV2ButtonParams.md#producttype)
- [sandbox](internal_.AmazonPayV2ButtonParams.md#sandbox)

## Properties

### buttonColor

• `Optional` **buttonColor**: [`AmazonPayV2ButtonColor`](../enums/internal_.AmazonPayV2ButtonColor.md)

Color of the Amazon Pay button.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[buttonColor](internal_.AmazonPayV2ButtonConfig.md#buttoncolor)

___

### checkoutLanguage

• `Optional` **checkoutLanguage**: [`AmazonPayV2CheckoutLanguage`](../enums/internal_.AmazonPayV2CheckoutLanguage.md)

Language used to render the button and text on Amazon Pay hosted pages.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[checkoutLanguage](internal_.AmazonPayV2ButtonConfig.md#checkoutlanguage)

___

### createCheckoutSession

• **createCheckoutSession**: [`AmazonPayV2CheckoutSession`](internal_.AmazonPayV2CheckoutSession.md)

Configuration for calling the endpoint to Create Checkout Session.

___

### ledgerCurrency

• **ledgerCurrency**: [`AmazonPayV2LedgerCurrency`](../enums/internal_.AmazonPayV2LedgerCurrency.md)

Ledger currency provided during registration for the given merchant identifier.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[ledgerCurrency](internal_.AmazonPayV2ButtonConfig.md#ledgercurrency)

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[merchantId](internal_.AmazonPayV2ButtonConfig.md#merchantid)

___

### placement

• **placement**: [`AmazonPayV2Placement`](../enums/internal_.AmazonPayV2Placement.md)

Placement of the Amazon Pay button on your website.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[placement](internal_.AmazonPayV2ButtonConfig.md#placement)

___

### productType

• `Optional` **productType**: [`AmazonPayV2PayOptions`](../enums/internal_.AmazonPayV2PayOptions.md)

Product type selected for checkout. Default is 'PayAndShip'.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[productType](internal_.AmazonPayV2ButtonConfig.md#producttype)

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. You do not have to set this parameter
if your `publicKeyId` has an environment prefix. Default is false.

#### Inherited from

[AmazonPayV2ButtonConfig](internal_.AmazonPayV2ButtonConfig.md).[sandbox](internal_.AmazonPayV2ButtonConfig.md#sandbox)
