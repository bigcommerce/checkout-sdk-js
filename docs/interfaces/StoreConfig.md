[**@bigcommerce/checkout-sdk**](../README.md)

***

[@bigcommerce/checkout-sdk](../README.md) / StoreConfig

# Interface: StoreConfig

## Properties

### b2bApiSettings?

> `optional` **b2bApiSettings?**: [`B2BApiSettings`](B2BApiSettings.md)

***

### cdnPath

> **cdnPath**: `string`

***

### checkoutSettings

> **checkoutSettings**: [`CheckoutSettings`](CheckoutSettings.md)

***

### currency

> **currency**: [`StoreCurrency`](StoreCurrency.md)

***

### displayDateFormat

> **displayDateFormat**: `string`

***

### displaySettings

> **displaySettings**: [`DisplaySettings`](DisplaySettings.md)

***

### ~~formFields~~

> **formFields**: [`FormFields`](FormFields.md)

#### Deprecated

Please use instead the data selectors

#### Remarks

```js
const data = CheckoutService.getState().data;
const shippingAddressFields = data.getShippingAddressFields('US');
const billingAddressFields = data.getBillingAddressFields('US');
const customerAccountFields = data.getCustomerAccountFields();
```

***

### imageDirectory

> **imageDirectory**: `string`

***

### inputDateFormat

> **inputDateFormat**: `string`

***

### inventorySettings?

> `optional` **inventorySettings?**: [`InventorySettings`](InventorySettings.md)

***

### isAngularDebuggingEnabled

> **isAngularDebuggingEnabled**: `boolean`

***

### links

> **links**: [`StoreLinks`](StoreLinks.md)

***

### paymentSettings

> **paymentSettings**: [`PaymentSettings`](PaymentSettings.md)

***

### shopperConfig

> **shopperConfig**: [`ShopperConfig`](ShopperConfig.md)

***

### shopperCurrency

> **shopperCurrency**: [`ShopperCurrency`](ShopperCurrency.md)

***

### storeProfile

> **storeProfile**: [`StoreProfile`](StoreProfile.md)
