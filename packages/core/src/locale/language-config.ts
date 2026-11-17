export default interface LanguageConfig {
    defaultTranslations: Translations;
    defaultLocale?: string;
    fallbackTranslations?: Translations;
    fallbackLocale?: string;
    locale: string;
    locales: Locales;
    translations: Translations;
}

export interface TransformedLanguageConfig {
    defaultTranslations: Translations;
    defaultLocale?: string;
    fallbackTranslations?: Translations;
    fallbackLocale?: string;
    locale: string;
    locales: Locales;
    translations: TransformedTranslations;
}

export interface Translations {
    [key: string]: string | Translations;
}

export type TransformedTranslations = Record<string, string>;

export type Locales = Record<string, string>;
