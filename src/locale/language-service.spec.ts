import { Logger, NoopLogger } from '../common/log';

import LanguageService from './language-service';

describe('LanguageService', () => {
    let config;
    let langService: LanguageService;
    let logger: Logger;

    beforeEach(() => {
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

        logger = new NoopLogger();

        jest.spyOn(logger, 'warn');

        langService = new LanguageService(config, logger);
    });

    it('has methods that can be destructed', () => {
        const { translate } = langService;

        expect(() => translate('test.continue_as_guest_action'))
            .not.toThrow(TypeError);
    });

    describe('#translate()', () => {
        it('returns translated strings', () => {
            expect(langService.translate('test.continue_as_guest_action')).toEqual('Continue as guest');
            expect(langService.translate('test.order_number_text', { orderNumber: '12345' })).toEqual('Your order number is 12345');
        });

        it('pluralizes strings using ICU format', () => {
            expect(langService.translate('test.item_count_text', { count: 0 })).toEqual('0 Items');
            expect(langService.translate('test.item_count_text', { count: 1 })).toEqual('1 Item');
            expect(langService.translate('test.item_count_text', { count: 10 })).toEqual('10 Items');
        });

        it('supports non-English pluralization rules', () => {
            config = {
                locale: 'cs',
                translations: {
                    'optimized_checkout.test.days_text': '{count, plural, one{1 den} few{# dny} many{# dne} other{# dní} }',
                },
            };

            langService = new LanguageService(config, logger);

            expect(langService.translate('test.days_text', { count: 1 })).toEqual('1 den');
            expect(langService.translate('test.days_text', { count: 2 })).toEqual('2 dny');
            expect(langService.translate('test.days_text', { count: 1.5 })).toEqual('1.5 dne');
            expect(langService.translate('test.days_text', { count: 100 })).toEqual('100 dní');
        });

        it('supports multiple locales', () => {
            config = {
                locale: 'fr',
                locales: {
                    'optimized_checkout.test.direction_text': 'fr', // French has less ordinals than English
                    'optimized_checkout.test.position_text': 'en',
                },
                translations: {
                    'optimized_checkout.test.direction_text': 'Prenez la {count, selectordinal, one{#re} other{#e}} à droite',
                    'optimized_checkout.test.position_text': '{count, selectordinal, one{#st} two{#nd} few{#rd} other{#th}} position',
                },
            };

            langService = new LanguageService(config, logger);

            expect(langService.translate('test.direction_text', { count: 1 })).toEqual('Prenez la 1re à droite');
            expect(langService.translate('test.direction_text', { count: 2 })).toEqual('Prenez la 2e à droite');
            expect(langService.translate('test.direction_text', { count: 3 })).toEqual('Prenez la 3e à droite');
            expect(langService.translate('test.position_text', { count: 1 })).toEqual('1st position');
            expect(langService.translate('test.position_text', { count: 2 })).toEqual('2nd position');
            expect(langService.translate('test.position_text', { count: 3 })).toEqual('3rd position');
        });

        it('should return default translations if user-preferred language file is not available', () => {
            expect(langService.translate('test.customer_heading')).toEqual('Customer');
            expect(langService.translate('test.greeting_text', { name: 'David' })).toEqual('Welcome David');
        });

        it('should return the translation key if both custom and default translation is missing', () => {
            expect(langService.translate('test.random')).toEqual('optimized_checkout.test.random');
        });
    });

    describe('#getLocale()', () => {
        it('returns the theme locale if the current theme provides translations for UCO', () => {
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

            langService = new LanguageService(config, logger);

            expect(langService.getLocale()).toEqual('zh-TW');
        });

        it('returns the default locale if the current theme does not provide translations for UCO', () => {
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

            langService = new LanguageService(config, logger);

            expect(langService.getLocale()).toEqual('en');
        });
    });

    describe('#mapKeys()', () => {
        it('sets up an alias by mapping one language key to another', () => {
            langService.mapKeys({
                'mydirective.text': 'test.email_label',
            });

            const result = langService.translate('mydirective.text');
            const expected = langService.translate('test.email_label');

            expect(result).toEqual(expected);
        });

        it('sets up an alias that works with template variables', () => {
            const name = 'Andrea';

            langService.mapKeys({
                'mydirective.text': 'test.greeting_text',
            });

            const result = langService.translate('mydirective.text', { name });
            const expected = langService.translate('test.greeting_text', { name });

            expect(result).toEqual(expected);
            expect(result).toContain(name);
        });
    });
});
