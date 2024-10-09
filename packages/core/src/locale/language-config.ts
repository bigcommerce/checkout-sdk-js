export default interface LanguageConfig {
    defaultTranslations: Translations;
    defaultLocale?: string;
    fallbackTranslations?: Translations;
    fallbackLocale?: string;
    locale: string;
    locales: Locales;
    translations: Translations;
    /**
     * @hidden This property is intended for toggling an experimental change only.
     */
    isCspNonceExperimentEnabled?: boolean;
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

export interface TransformedTranslations {
    [key: string]: string;
}

export interface Locales {
    [key: string]: string;
}
