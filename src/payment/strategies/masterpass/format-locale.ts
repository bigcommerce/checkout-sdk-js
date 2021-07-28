import { supportedLocales } from './masterpass-supported-locales';

export default function formatLocale(localeLanguage: string): string {
    let locale = 'en_us';
    const [language, country] = localeLanguage.replace('-', '_').toLowerCase().split('_');
    const formatedLocale = `${language}_${country}`;
    if (language in supportedLocales) {
        if (country) {
            locale = supportedLocales[language].indexOf(formatedLocale) !== -1 ? formatedLocale : supportedLocales[language][0];
        } else {
            locale = supportedLocales[language][0];
        }
    }

    return locale;
}
