[@bigcommerce/checkout-sdk](../README.md) / AmazonPayV2ButtonParams

# Interface: AmazonPayV2ButtonParams

## Table of contents

### Properties

- [checkoutLanguage](AmazonPayV2ButtonParams.md#checkoutlanguage)
- [createCheckoutSession](AmazonPayV2ButtonParams.md#createcheckoutsession)
- [ledgerCurrency](AmazonPayV2ButtonParams.md#ledgercurrency)
- [merchantId](AmazonPayV2ButtonParams.md#merchantid)
- [placement](AmazonPayV2ButtonParams.md#placement)
- [productType](AmazonPayV2ButtonParams.md#producttype)
- [sandbox](AmazonPayV2ButtonParams.md#sandbox)

## Properties

### checkoutLanguage

• `Optional` **checkoutLanguage**: [`en_US`](../enums/AmazonPayV2CheckoutLanguage.md#en_us) \| [`en_GB`](../enums/AmazonPayV2CheckoutLanguage.md#en_gb) \| [`de_DE`](../enums/AmazonPayV2CheckoutLanguage.md#de_de) \| [`fr_FR`](../enums/AmazonPayV2CheckoutLanguage.md#fr_fr) \| [`it_IT`](../enums/AmazonPayV2CheckoutLanguage.md#it_it) \| [`es_ES`](../enums/AmazonPayV2CheckoutLanguage.md#es_es) \| [`ja_JP`](../enums/AmazonPayV2CheckoutLanguage.md#ja_jp)

Language used to render the button and text on Amazon Pay hosted pages.

___

### createCheckoutSession

• **createCheckoutSession**: [`AmazonPayV2CheckoutSession`](AmazonPayV2CheckoutSession.md)

Configuration for calling the endpoint to Create Checkout Session.

___

### ledgerCurrency

• **ledgerCurrency**: [`AmazonPayV2LedgerCurrency`](../enums/AmazonPayV2LedgerCurrency.md)

Ledger currency provided during registration for the given merchant identifier.

___

### merchantId

• **merchantId**: `string`

Amazon Pay merchant account identifier.

___

### placement

• **placement**: [`AmazonPayV2Placement`](../enums/AmazonPayV2Placement.md)

Placement of the Amazon Pay button on your website.

___

### productType

• `Optional` **productType**: [`PayAndShip`](../enums/AmazonPayV2PayOptions.md#payandship) \| [`PayOnly`](../enums/AmazonPayV2PayOptions.md#payonly)

Product type selected for checkout. Default is 'PayAndShip'.

___

### sandbox

• `Optional` **sandbox**: `boolean`

Sets button to Sandbox environment. Default is false.
