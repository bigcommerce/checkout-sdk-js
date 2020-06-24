[@bigcommerce/checkout-sdk](../README.md) › [LanguageService](languageservice.md)

# Class: LanguageService

Responsible for getting language strings.

This object can be used to retrieve language strings that are most
appropriate for a given locale.

The language strings provided to the object should follow [ICU
MessageFormat](http://userguide.icu-project.org/formatparse/messages) syntax.

## Hierarchy

* **LanguageService**

## Index

### Methods

* [getLocale](languageservice.md#getlocale)
* [mapKeys](languageservice.md#mapkeys)
* [translate](languageservice.md#translate)

## Methods

###  getLocale

▸ **getLocale**(): *string*

Gets the preferred locale of the current customer.

**Returns:** *string*

The preferred locale code.

___

###  mapKeys

▸ **mapKeys**(`maps`: object): *void*

Remaps a set of language strings with a different set of keys.

```js
service.mapKeys({
    'new_key': 'existing_key',
});

console.log(service.translate('new_key'));
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`maps` | object | The set of language strings.  |

**Returns:** *void*

___

###  translate

▸ **translate**(`key`: string, `data?`: [TranslationData](../interfaces/translationdata.md)): *string*

Gets a language string by a key.

```js
service.translate('language_key');
```

If the language string contains a placeholder, you can replace it by
providing a second argument.

```js
service.translate('language_key', { placeholder: 'Hello' });
```

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`key` | string | The language key. |
`data?` | [TranslationData](../interfaces/translationdata.md) | Data for replacing placeholders in the language string. |

**Returns:** *string*

The translated language string.
