[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / AmazonPayV2CheckoutSessionConfig

# Interface: AmazonPayV2CheckoutSessionConfig

[<internal>](../modules/internal_.md).AmazonPayV2CheckoutSessionConfig

## Table of contents

### Properties

- [payloadJSON](internal_.AmazonPayV2CheckoutSessionConfig.md#payloadjson)
- [publicKeyId](internal_.AmazonPayV2CheckoutSessionConfig.md#publickeyid)
- [signature](internal_.AmazonPayV2CheckoutSessionConfig.md#signature)

## Properties

### payloadJSON

• **payloadJSON**: `string`

A payload that Amazon Pay will use to create a Checkout Session object.

___

### publicKeyId

• `Optional` **publicKeyId**: `string`

Credential provided by Amazon Pay. You do not have to set this parameter
if your `publicKeyId` has an environment prefix.

___

### signature

• **signature**: `string`

Payload's signature.
