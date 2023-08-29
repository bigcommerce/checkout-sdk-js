[@bigcommerce/checkout-sdk](../README.md) / StoreConfig

# Interface: StoreConfig

## Table of contents

### Properties

- [cdnPath](StoreConfig.md#cdnpath)
- [checkoutSettings](StoreConfig.md#checkoutsettings)
- [currency](StoreConfig.md#currency)
- [displayDateFormat](StoreConfig.md#displaydateformat)
- [displaySettings](StoreConfig.md#displaysettings)
- [formFields](StoreConfig.md#formfields)
- [imageDirectory](StoreConfig.md#imagedirectory)
- [inputDateFormat](StoreConfig.md#inputdateformat)
- [isAngularDebuggingEnabled](StoreConfig.md#isangulardebuggingenabled)
- [links](StoreConfig.md#links)
- [paymentSettings](StoreConfig.md#paymentsettings)
- [shopperConfig](StoreConfig.md#shopperconfig)
- [shopperCurrency](StoreConfig.md#shoppercurrency)
- [storeProfile](StoreConfig.md#storeprofile)

## Properties

### cdnPath

• **cdnPath**: `string`

___

### checkoutSettings

• **checkoutSettings**: [`CheckoutSettings`](CheckoutSettings.md)

___

### currency

• **currency**: [`StoreCurrency`](StoreCurrency.md)

___

### displayDateFormat

• **displayDateFormat**: `string`

___

### displaySettings

• **displaySettings**: [`DisplaySettings`](DisplaySettings.md)

___

### formFields

• **formFields**: [`FormFields`](FormFields.md)

**`deprecated`** Please use instead the data selectors

**`remarks`**
```js
const data = CheckoutService.getState().data;
const shippingAddressFields = data.getShippingAddressFields('US');
const billingAddressFields = data.getBillingAddressFields('US');
const customerAccountFields = data.getCustomerAccountFields();
```

___

### imageDirectory

• **imageDirectory**: `string`

___

### inputDateFormat

• **inputDateFormat**: `string`

___

### isAngularDebuggingEnabled

• **isAngularDebuggingEnabled**: `boolean`

___

### links

• **links**: [`StoreLinks`](StoreLinks.md)

___

### paymentSettings

• **paymentSettings**: [`PaymentSettings`](PaymentSettings.md)

___

### shopperConfig

• **shopperConfig**: [`ShopperConfig`](ShopperConfig.md)

___

### shopperCurrency

• **shopperCurrency**: [`ShopperCurrency`](ShopperCurrency.md)

___

### storeProfile

• **storeProfile**: [`StoreProfile`](StoreProfile.md)
