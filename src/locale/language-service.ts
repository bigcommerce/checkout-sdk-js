/// <reference path="./messageformat.d.ts" />
import { isObject, union } from 'lodash';
import * as MessageFormat from 'messageformat';

import Logger from '../common/log/logger';

import LanguageConfig, { Locales, Translations } from './language-config';

const DEFAULT_LOCALE = 'en';
const KEY_PREFIX = 'optimized_checkout';

export default class LanguageService {
    private _locale: string;
    private _locales: Locales;
    private _translations: Translations;
    private _formatters: { [key: string]: any };

    constructor(
        config: Partial<LanguageConfig>,
        private _logger: Logger
    ) {
        const { locale, locales, translations } = this._transformConfig(config);

        this._locale = locale;
        this._locales = locales;
        this._translations = translations;
        this._formatters = {};
    }

    mapKeys(maps: { [key: string]: string } = {}): void {
        Object.keys(maps).forEach((key) => {
            const translationKey = `${KEY_PREFIX}.${maps[key]}`;

            this._translations[`${KEY_PREFIX}.${key}`] = this._translations[translationKey];
        });
    }

    getLocale(): string {
        return this._hasTranslations() ? this._locale : DEFAULT_LOCALE;
    }

    translate(rawKey: string, data: PlaceholderData = {}): string {
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

    private _transformConfig(config: Partial<LanguageConfig> = {}): LanguageConfig {
        const output: LanguageConfig = {
            defaultTranslations: {},
            translations: {},
            locales: {},
            locale: config.locale || DEFAULT_LOCALE,
        };

        const locales = config.locales || {};
        const translations = this._flattenObject(config.translations || {});
        const defaultTranslations = this._flattenObject(config.defaultTranslations || {});
        const translationKeys = union(Object.keys(defaultTranslations), Object.keys(translations));

        translationKeys.forEach((key) => {
            if (translations && translations[key]) {
                output.translations[key] = translations[key];
                output.locales[key] = locales[key] || output.locale;
            } else {
                output.translations[key] = defaultTranslations[key];
                output.locales[key] = DEFAULT_LOCALE;
            }
        });

        return output;
    }

    private _flattenObject(object: Translations, result: Translations = {}, parentKey: string = ''): Translations {
        try {
            Object.keys(object).forEach((key) => {
                const value = object[key];
                const resultKey = parentKey ? `${parentKey}.${key}` : key;

                if (isObject(value)) {
                    return this._flattenObject(value as Translations, result, resultKey);
                }

                result[resultKey] = value;
            });
        } catch (err) {
            this._logger.warn(`Unable to parse object: ${err}`);
        }

        return result;
    }

    private _transformData(data: PlaceholderData): PlaceholderData {
        return Object.keys(data).reduce((result, key) => {
            const value = data[key];

            result[key] = value === null || value === undefined ? '' : value;

            return result;
        }, {} as PlaceholderData);
    }

    private _hasTranslations(): boolean {
        return Object.keys(this._locales).map((key) => this._locales[key])
            .filter((code) => code.split('-')[0] === this._locale.split('-')[0])
            .length > 0;
    }
}

export interface PlaceholderData {
    [key: string]: any;
}
