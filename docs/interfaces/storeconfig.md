[@bigcommerce/checkout-sdk](../README.md) › [StoreConfig](storeconfig.md)

# Interface: StoreConfig

## Hierarchy

* **StoreConfig**

## Index

### Properties

* [cdnPath](storeconfig.md#cdnpath)
* [checkoutSettings](storeconfig.md#checkoutsettings)
* [currency](storeconfig.md#currency)
* [displayDateFormat](storeconfig.md#displaydateformat)
* [formFields](storeconfig.md#formfields)
* [imageDirectory](storeconfig.md#imagedirectory)
* [inputDateFormat](storeconfig.md#inputdateformat)
* [isAngularDebuggingEnabled](storeconfig.md#isangulardebuggingenabled)
* [links](storeconfig.md#links)
* [paymentSettings](storeconfig.md#paymentsettings)
* [shopperConfig](storeconfig.md#shopperconfig)
* [shopperCurrency](storeconfig.md#shoppercurrency)
* [storeProfile](storeconfig.md#storeprofile)

## Properties

###  cdnPath

• **cdnPath**: *string*

___

###  checkoutSettings

• **checkoutSettings**: *[CheckoutSettings](checkoutsettings.md)*

___

###  currency

• **currency**: *[StoreCurrency](storecurrency.md)*

___

###  displayDateFormat

• **displayDateFormat**: *string*

___

###  formFields

• **formFields**: *[FormFields](formfields.md)*

**`deprecated`** Please use instead the data selectors

**`remarks`** 
```js
const data = CheckoutService.getState().data;
const shippingAddressFields = data.getShippingAddressFields('US');
const billingAddressFields = data.getBillingAddressFields('US');
const customerAccountFields = data.getCustomerAccountFields();
```

___

###  imageDirectory

• **imageDirectory**: *string*

___

###  inputDateFormat

• **inputDateFormat**: *string*

___

###  isAngularDebuggingEnabled

• **isAngularDebuggingEnabled**: *boolean*

___

###  links

• **links**: *[StoreLinks](storelinks.md)*

___

###  paymentSettings

• **paymentSettings**: *[PaymentSettings](paymentsettings.md)*

___

###  shopperConfig

• **shopperConfig**: *[ShopperConfig](shopperconfig.md)*

___

###  shopperCurrency

• **shopperCurrency**: *[ShopperCurrency](shoppercurrency.md)*

___

###  storeProfile

• **storeProfile**: *[StoreProfile](storeprofile.md)*
