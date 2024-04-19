import { supportedLocales } from './masterpass-supported-locales';

export default function formatLocale(localeLanguage: string): string {
    const [language, country] = localeLanguage.replace('-', '_').toLowerCase().split('_');
    const formattedLocale = `${language}_${country}`;
    const countryLocales = supportedLocales[language];

    if (!countryLocales) {
        return 'en_us';
    }

    return countryLocales.indexOf(formattedLocale) > -1 ? formattedLocale : countryLocales[0];
}
