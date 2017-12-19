"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageFormat = require("messageformat");
var lodash_1 = require("lodash");
var DEFAULT_LOCALE = 'en';
var KEY_PREFIX = 'optimized_checkout';
var LanguageService = /** @class */ (function () {
    /**
     * @constructor
     * @param {LanguageConfig} config
     * @param {Logger} logger
     */
    function LanguageService(config, logger) {
        this._logger = logger;
        var _a = this._transformConfig(config), locale = _a.locale, locales = _a.locales, translations = _a.translations;
        this._locale = locale;
        this._locales = locales;
        this._translations = translations;
        this._formatters = {};
    }
    /**
     * @param {Object} [maps={}]
     * @returns {void}
     */
    LanguageService.prototype.mapKeys = function (maps) {
        var _this = this;
        if (maps === void 0) { maps = {}; }
        Object.keys(maps).forEach(function (key) {
            var translationKey = KEY_PREFIX + "." + maps[key];
            _this._translations[KEY_PREFIX + "." + key] = _this._translations[translationKey];
        });
    };
    /**
     * @return {string}
     */
    LanguageService.prototype.getLocale = function () {
        return this._hasTranslations() ? this._locale : DEFAULT_LOCALE;
    };
    /**
     * @param {string} key
     * @param {Object} [data={}]
     * @returns {string}
     */
    LanguageService.prototype.translate = function (rawKey, data) {
        if (data === void 0) { data = {}; }
        var key = KEY_PREFIX + "." + rawKey;
        if (typeof this._translations[key] !== 'string') {
            this._logger.warn("Translation key \"" + key + "\" is missing");
            return key;
        }
        if (!this._formatters[key]) {
            var messageFormat = new MessageFormat(this._locales[key]);
            this._formatters[key] = messageFormat.compile(this._translations[key] || '');
        }
        return this._formatters[key](this._transformData(data));
    };
    /**
     * @private
     * @param {LanguageConfig} [config={}]
     * @returns {LanguageConfig}
     */
    LanguageService.prototype._transformConfig = function (config) {
        if (config === void 0) { config = {}; }
        var output = {
            defaultTranslations: {},
            translations: {},
            locales: {},
            locale: config.locale || DEFAULT_LOCALE,
        };
        var locales = config.locales || {};
        var translations = this._flattenObject(config.translations || {});
        var defaultTranslations = this._flattenObject(config.defaultTranslations || {});
        var translationKeys = lodash_1.union(Object.keys(defaultTranslations), Object.keys(translations));
        translationKeys.forEach(function (key) {
            if (translations && translations[key]) {
                output.translations[key] = translations[key];
                output.locales[key] = locales[key] || config.locale;
            }
            else {
                output.translations[key] = defaultTranslations[key];
                output.locales[key] = DEFAULT_LOCALE;
            }
        });
        return output;
    };
    /**
     * @private
     * @param {Object} object
     * @param {Object} [result={}]
     * @param {string} [parentKey='']
     * @returns {Object}
     */
    LanguageService.prototype._flattenObject = function (object, result, parentKey) {
        var _this = this;
        if (result === void 0) { result = {}; }
        if (parentKey === void 0) { parentKey = ''; }
        try {
            Object.keys(object).forEach(function (key) {
                var value = object[key];
                var resultKey = parentKey ? parentKey + "." + key : key;
                if (lodash_1.isObject(value)) {
                    return _this._flattenObject(value, result, resultKey);
                }
                result[resultKey] = value;
            });
        }
        catch (err) {
            this._logger.warn("Unable to parse object: " + err);
        }
        return result;
    };
    /**
     * @private
     * @param {Object} data
     * @returns {Object}
     */
    LanguageService.prototype._transformData = function (data) {
        return Object.keys(data).reduce(function (result, key) {
            var value = data[key];
            result[key] = value === null || value === undefined ? '' : value;
            return result;
        }, {});
    };
    /**
     * @private
     * @return {boolean}
     */
    LanguageService.prototype._hasTranslations = function () {
        var _this = this;
        return Object.keys(this._locales).map(function (key) { return _this._locales[key]; })
            .filter(function (code) { return code.split('-')[0] === _this._locale.split('-')[0]; })
            .length > 0;
    };
    return LanguageService;
}());
exports.default = LanguageService;
//# sourceMappingURL=language-service.js.map