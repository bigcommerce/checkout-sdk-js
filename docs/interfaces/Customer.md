[@bigcommerce/checkout-sdk](../README.md) / Customer

# Interface: Customer

## Table of contents

### Properties

- [addresses](Customer.md#addresses)
- [customerGroup](Customer.md#customergroup)
- [email](Customer.md#email)
- [firstName](Customer.md#firstname)
- [fullName](Customer.md#fullname)
- [id](Customer.md#id)
- [isGuest](Customer.md#isguest)
- [isStripeLinkAuthenticated](Customer.md#isstripelinkauthenticated)
- [lastName](Customer.md#lastname)
- [shouldEncourageSignIn](Customer.md#shouldencouragesignin)
- [storeCredit](Customer.md#storecredit)

## Properties

### addresses

• **addresses**: [`CustomerAddress`](CustomerAddress.md)[]

___

### customerGroup

• `Optional` **customerGroup**: [`CustomerGroup`](CustomerGroup.md)

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
