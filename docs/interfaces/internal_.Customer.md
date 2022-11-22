[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / Customer

# Interface: Customer

[<internal>](../modules/internal_.md).Customer

## Table of contents

### Properties

- [addresses](internal_.Customer.md#addresses)
- [customerGroup](internal_.Customer.md#customergroup)
- [email](internal_.Customer.md#email)
- [firstName](internal_.Customer.md#firstname)
- [fullName](internal_.Customer.md#fullname)
- [id](internal_.Customer.md#id)
- [isGuest](internal_.Customer.md#isguest)
- [isStripeLinkAuthenticated](internal_.Customer.md#isstripelinkauthenticated)
- [lastName](internal_.Customer.md#lastname)
- [shouldEncourageSignIn](internal_.Customer.md#shouldencouragesignin)
- [storeCredit](internal_.Customer.md#storecredit)

## Properties

### addresses

• **addresses**: [`CustomerAddress`](internal_.CustomerAddress.md)[]

___

### customerGroup

• `Optional` **customerGroup**: [`CustomerGroup`](internal_.CustomerGroup.md)

___

### email

• **email**: `string`

The email address of the signed in customer.

___

### firstName

• **firstName**: `string`

___

### fullName

• **fullName**: `string`

___

### id

• **id**: `number`

___

### isGuest

• **isGuest**: `boolean`

___

### isStripeLinkAuthenticated

• `Optional` **isStripeLinkAuthenticated**: `boolean`

___

### lastName

• **lastName**: `string`

___

### shouldEncourageSignIn

• **shouldEncourageSignIn**: `boolean`

Indicates whether the customer should be prompted to sign-in.

Note: You need to enable "Prompt existing accounts to sign in" in your Checkout Settings.

___

### storeCredit

• **storeCredit**: `number`
