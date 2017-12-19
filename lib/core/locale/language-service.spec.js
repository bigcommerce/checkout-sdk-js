"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var language_service_1 = require("./language-service");
describe('LanguageService', function () {
    var config;
    var langService;
    var logger;
    beforeEach(function () {
        config = {
            locale: 'en',
            defaultTranslations: {
                optimized_checkout: {
                    test: {
                        customer_heading: 'Customer',
                        greeting_text: 'Welcome {name}',
                    },
                },
            },
            translations: {
                'optimized_checkout.test.item_count_text': '{count, plural, one{1 Item} other{# Items}}',
                'optimized_checkout.test.continue_as_guest_action': 'Continue as guest',
                'optimized_checkout.test.email_label': 'Email Address',
                'optimized_checkout.test.order_number_text': 'Your order number is {orderNumber}',
            },
        };
        logger = {
            warn: jest.fn(),
        };
        langService = new language_service_1.default(config, logger);
    });
    describe('#translate()', function () {
        it('returns translated strings', function () {
            expect(langService.translate('test.continue_as_guest_action')).toEqual('Continue as guest');
            expect(langService.translate('test.order_number_text', { orderNumber: '12345' })).toEqual('Your order number is 12345');
        });
        it('pluralizes strings using ICU format', function () {
            expect(langService.translate('test.item_count_text', { count: 0 })).toEqual('0 Items');
            expect(langService.translate('test.item_count_text', { count: 1 })).toEqual('1 Item');
            expect(langService.translate('test.item_count_text', { count: 10 })).toEqual('10 Items');
        });
        it('supports non-English pluralization rules', function () {
            config = {
                locale: 'cs',
                translations: {
                    'optimized_checkout.test.days_text': '{count, plural, one{1 den} few{# dny} many{# dne} other{# dní} }',
                },
            };
            langService = new language_service_1.default(config, logger);
            expect(langService.translate('test.days_text', { count: 1 })).toEqual('1 den');
            expect(langService.translate('test.days_text', { count: 2 })).toEqual('2 dny');
            expect(langService.translate('test.days_text', { count: 1.5 })).toEqual('1.5 dne');
            expect(langService.translate('test.days_text', { count: 100 })).toEqual('100 dní');
        });
        it('supports multiple locales', function () {
            config = {
                locale: 'fr',
                locales: {
                    'optimized_checkout.test.direction_text': 'fr',
                    'optimized_checkout.test.position_text': 'en',
                },
                translations: {
                    'optimized_checkout.test.direction_text': 'Prenez la {count, selectordinal, one{#re} other{#e}} à droite',
                    'optimized_checkout.test.position_text': '{count, selectordinal, one{#st} two{#nd} few{#rd} other{#th}} position',
                },
            };
            langService = new language_service_1.default(config, logger);
            expect(langService.translate('test.direction_text', { count: 1 })).toEqual('Prenez la 1re à droite');
            expect(langService.translate('test.direction_text', { count: 2 })).toEqual('Prenez la 2e à droite');
            expect(langService.translate('test.direction_text', { count: 3 })).toEqual('Prenez la 3e à droite');
            expect(langService.translate('test.position_text', { count: 1 })).toEqual('1st position');
            expect(langService.translate('test.position_text', { count: 2 })).toEqual('2nd position');
            expect(langService.translate('test.position_text', { count: 3 })).toEqual('3rd position');
        });
        it('should return default translations if user-preferred language file is not available', function () {
            expect(langService.translate('test.customer_heading')).toEqual('Customer');
            expect(langService.translate('test.greeting_text', { name: 'David' })).toEqual('Welcome David');
        });
        it('should return the translation key if both custom and default translation is missing', function () {
            expect(langService.translate('test.random')).toEqual('optimized_checkout.test.random');
        });
    });
    describe('#getLocale()', function () {
        it('returns the theme locale if the current theme provides translations for UCO', function () {
            config = {
                locale: 'zh-TW',
                locales: {
                    'optimized_checkout.test.direction_text': 'zh',
                    'optimized_checkout.test.position_text': 'en',
                },
                translations: {
                    'optimized_checkout.test.direction_text': 'direction_text',
                    'optimized_checkout.test.position_text': 'position_text',
                },
            };
            langService = new language_service_1.default(config, logger);
            expect(langService.getLocale()).toEqual('zh-TW');
        });
        it('returns the default locale if the current theme does not provide translations for UCO', function () {
            config = {
                locale: 'zh',
                locales: {
                    'optimized_checkout.test.direction_text': 'en',
                    'optimized_checkout.test.position_text': 'en',
                },
                translations: {
                    'optimized_checkout.test.direction_text': 'direction_text',
                    'optimized_checkout.test.position_text': 'position_text',
                },
            };
            langService = new language_service_1.default(config, logger);
            expect(langService.getLocale()).toEqual('en');
        });
    });
    describe('#mapKeys()', function () {
        it('sets up an alias by mapping one language key to another', function () {
            langService.mapKeys({
                'mydirective.text': 'test.email_label',
            });
            var result = langService.translate('mydirective.text');
            var expected = langService.translate('test.email_label');
            expect(result).toEqual(expected);
        });
        it('sets up an alias that works with template variables', function () {
            var name = 'Andrea';
            langService.mapKeys({
                'mydirective.text': 'test.greeting_text',
            });
            var result = langService.translate('mydirective.text', { name: name });
            var expected = langService.translate('test.greeting_text', { name: name });
            expect(result).toEqual(expected);
            expect(result).toContain(name);
        });
    });
});
//# sourceMappingURL=language-service.spec.js.map