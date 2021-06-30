export default interface LanguageConfig {
    defaultTranslations: Translations;
    defaultLocale?: string;
    fallbackTranslations?: Translations;
    fallbackLocale?: string;
    locale: string;
    locales: Locales;
    translations: Translations;
}

export interface Translations {
    [key: string]: string | Translations;
}

export interface Locales {
    [key: string]: string;
}
