export default interface LanguageConfig {
    defaultTranslations: Translations;
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
