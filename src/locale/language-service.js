import * as MessageFormat from 'messageformat';
import { isObject, union } from 'lodash';

const DEFAULT_LOCALE = 'en';
const KEY_PREFIX = 'optimized_checkout';

export default class LanguageService {
    /**
     * @constructor
     * @param {LanguageConfig} config
     * @param {Logger} logger
     */
    constructor(config, logger) {
        this._logger = logger;

        const { locale, locales, translations } = this._transformConfig(config);

        this._locale = locale;
        this._locales = locales;
        this._translations = translations;
        this._formatters = {};
    }

    /**
     * @param {Object} [maps={}]
     * @returns {void}
     */
    mapKeys(maps = {}) {
        Object.keys(maps).forEach((key) => {
            const translationKey = `${KEY_PREFIX}.${maps[key]}`;

            this._translations[`${KEY_PREFIX}.${key}`] = this._translations[translationKey];
        });
    }

    /**
     * @return {string}
     */
    getLocale() {
        return this._hasTranslations() ? this._locale : DEFAULT_LOCALE;
    }

    /**
     * @param {string} key
     * @param {Object} [data={}]
     * @returns {string}
     */
    translate(rawKey, data = {}) {
        const key = `${KEY_PREFIX}.${rawKey}`;

        if (typeof this._translations[key] !== 'string') {
            this._logger.warn(`Translation key "${key}" is missing`);

            return key;
        }

        if (!this._formatters[key]) {
            const messageFormat = new MessageFormat(this._locales[key]);

            this._formatters[key] = messageFormat.compile(this._translations[key] || '');
        }

        return this._formatters[key](this._transformData(data));
    }

    /**
     * @private
     * @param {LanguageConfig} [config={}]
     * @returns {LanguageConfig}
     */
    _transformConfig(config = {}) {
        const output = {
            defaultTranslations: {},
            translations: {},
            locales: {},
            locale: config.locale || DEFAULT_LOCALE,
        };

        const locales = config.locales || {};
        const translations = this._flattenObject(config.translations || {});
        const defaultTranslations = this._flattenObject(config.defaultTranslations || {});
        const translationKeys = union(Object.keys(defaultTranslations), Object.keys(translations));

        translationKeys.forEach(key => {
            if (translations && translations[key]) {
                output.translations[key] = translations[key];
                output.locales[key] = locales[key] || config.locale;
            } else {
                output.translations[key] = defaultTranslations[key];
                output.locales[key] = DEFAULT_LOCALE;
            }
        });

        return output;
    }

    /**
     * @private
     * @param {Object} object
     * @param {Object} [result={}]
     * @param {string} [parentKey='']
     * @returns {Object}
     */
    _flattenObject(object, result = {}, parentKey = '') {
        try {
            Object.keys(object).forEach((key) => {
                const value = object[key];
                const resultKey = parentKey ? `${parentKey}.${key}` : key;

                if (isObject(value)) {
                    return this._flattenObject(value, result, resultKey);
                }

                result[resultKey] = value;
            });
        } catch (err) {
            this._logger.warn(`Unable to parse object: ${err}`);
        }

        return result;
    }

    /**
     * @private
     * @param {Object} data
     * @returns {Object}
     */
    _transformData(data) {
        return Object.keys(data).reduce((result, key) => {
            const value = data[key];

            result[key] = value === null || value === undefined ? '' : value;

            return result;
        }, {});
    }

    /**
     * @private
     * @return {boolean}
     */
    _hasTranslations() {
        return Object.keys(this._locales).map(key => this._locales[key])
            .filter(code => code.split('-')[0] === this._locale.split('-')[0])
            .length > 0;
    }
}
