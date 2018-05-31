[@bigcommerce/checkout-sdk](../README.md) > [LanguageService](../classes/languageservice.md)

# LanguageService

Responsible for getting language strings.

This object can be used to retrieve language strings that are most appropriate for a given locale.

The language strings provided to the object should follow [ICU MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.

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

Gets the preferred locale of the current customer.

**Returns:** `string`
The preferred locale code.

___
<a id="mapkeys"></a>

###  mapKeys

▸ **mapKeys**(maps: *`object`*): `void`

Remaps a set of language strings with a different set of keys.

```js
service.mapKeys({
    'new_key': 'existing_key',
});

console.log(service.translate('new_key'));
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| maps | `object` |  The set of language strings. |

**Returns:** `void`

___
<a id="translate"></a>

###  translate

▸ **translate**(key: *`string`*, data?: *[TranslationData](../interfaces/translationdata.md)*): `string`

Gets a language string by a key.

```js
service.translate('language_key');
```

If the language string contains a placeholder, you can replace it by providing a second argument.

```js
service.translate('language_key', { placeholder: 'Hello' });
```

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  The language key. |
| `Optional` data | [TranslationData](../interfaces/translationdata.md) |  Data for replacing placeholders in the language string. |

**Returns:** `string`
The translated language string.

___

