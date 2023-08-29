[@bigcommerce/checkout-sdk](../README.md) / AmazonPayV2CheckoutSessionConfig

# Interface: AmazonPayV2CheckoutSessionConfig

## Table of contents

### Properties

- [payloadJSON](AmazonPayV2CheckoutSessionConfig.md#payloadjson)
- [publicKeyId](AmazonPayV2CheckoutSessionConfig.md#publickeyid)
- [signature](AmazonPayV2CheckoutSessionConfig.md#signature)

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
