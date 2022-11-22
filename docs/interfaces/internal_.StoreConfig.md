[@bigcommerce/checkout-sdk](../README.md) / [<internal\>](../modules/internal_.md) / StoreConfig

# Interface: StoreConfig

[<internal>](../modules/internal_.md).StoreConfig

## Table of contents

### Properties

- [cdnPath](internal_.StoreConfig.md#cdnpath)
- [checkoutSettings](internal_.StoreConfig.md#checkoutsettings)
- [currency](internal_.StoreConfig.md#currency)
- [displayDateFormat](internal_.StoreConfig.md#displaydateformat)
- [displaySettings](internal_.StoreConfig.md#displaysettings)
- [formFields](internal_.StoreConfig.md#formfields)
- [imageDirectory](internal_.StoreConfig.md#imagedirectory)
- [inputDateFormat](internal_.StoreConfig.md#inputdateformat)
- [isAngularDebuggingEnabled](internal_.StoreConfig.md#isangulardebuggingenabled)
- [links](internal_.StoreConfig.md#links)
- [paymentSettings](internal_.StoreConfig.md#paymentsettings)
- [shopperConfig](internal_.StoreConfig.md#shopperconfig)
- [shopperCurrency](internal_.StoreConfig.md#shoppercurrency)
- [storeProfile](internal_.StoreConfig.md#storeprofile)

## Properties

### cdnPath

• **cdnPath**: `string`

___

### checkoutSettings

• **checkoutSettings**: [`CheckoutSettings`](internal_.CheckoutSettings.md)

___

### currency

• **currency**: [`StoreCurrency`](internal_.StoreCurrency.md)

___

### displayDateFormat

• **displayDateFormat**: `string`

___

### displaySettings

• **displaySettings**: [`DisplaySettings`](internal_.DisplaySettings.md)

___

### formFields

• **formFields**: [`FormFields`](internal_.FormFields.md)

**`deprecated`** Please use instead the data selectors

**`remarks`** ```js
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

• **links**: [`StoreLinks`](internal_.StoreLinks.md)

___

### paymentSettings

• **paymentSettings**: [`PaymentSettings`](internal_.PaymentSettings.md)

___

### shopperConfig

• **shopperConfig**: [`ShopperConfig`](internal_.ShopperConfig.md)

___

### shopperCurrency

• **shopperCurrency**: [`ShopperCurrency`](internal_.ShopperCurrency.md)

___

### storeProfile

• **storeProfile**: [`StoreProfile`](internal_.StoreProfile.md)
