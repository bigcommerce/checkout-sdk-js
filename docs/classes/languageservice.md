[@bigcommerce/checkout-sdk](../README.md) > [LanguageService](../classes/languageservice.md)

# LanguageService

## Hierarchy

**LanguageService**

## Index

### Methods

* [getLocale](languageservice.md#getlocale)
* [mapKeys](languageservice.md#mapkeys)
* [translate](languageservice.md#translate)

---

## Methods

<a id="getlocale"></a>

###  getLocale

▸ **getLocale**(): `string`

**Returns:** `string`
The preferred locale code.

___
<a id="mapkeys"></a>

###  mapKeys

▸ **mapKeys**(maps: *`object`*): `void`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| maps | `object` |  The set of language strings. |

**Returns:** `void`

___
<a id="translate"></a>

###  translate

▸ **translate**(key: *`string`*, data?: *[TranslationData](../interfaces/translationdata.md)*): `string`

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  The language key. |
| `Optional` data | [TranslationData](../interfaces/translationdata.md) |  Data for replacing placeholders in the language string. |

**Returns:** `string`
The translated language string.

___

