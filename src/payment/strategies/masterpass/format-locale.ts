export default function formatLocale(localeLanguage: string): string {
    const supportedLocales: {[language: string]: string[]} = {es: ['es_es', 'es_mx', 'es_pe', 'es_co', 'es_ar', 'es_cl'],
            en: ['en_us', 'en_gb', 'en_ca', 'en_es', 'en_fr', 'en_ie', 'en_sg', 'en_au', 'en_nz', 'en_my', 'en_hk', 'en_th', 'en_ae', 'en_sa', 'en_qa', 'en_kw', 'en_za'],
            pt: ['pt_br'],
            zu: ['zu_za'],
            ar: ['ar_sa', 'ar_ae', 'ar_qa', 'ar_kw'],
            zh: ['zh_sg', 'zh_hk'],
            ms: ['ms_my'],
            uk: ['uk_ua'],
            sv: ['sv_se'],
            hr: ['hr_hr'],
            pl: ['pl_pl'],
            nl: ['nl_be'],
            it: ['it_it'],
            de: ['de_de'],
            fr: ['fr_fr', 'fr_ca']};
    let locale = 'en_us';
    const formatedLocale = localeLanguage.replace('-', '_').toLowerCase();
    const regexLocale = formatedLocale.match(/^([a-z]{2})((?:\_)([a-z]{2}))?$/);
    if (regexLocale && regexLocale[3]) {
        if (regexLocale[1] in supportedLocales) {
            locale = supportedLocales[regexLocale[1]].indexOf(regexLocale[0]) !== -1 ? formatedLocale : supportedLocales[regexLocale[1]][0];
        }
    } else if (regexLocale) {
        locale = regexLocale[1] in supportedLocales ? supportedLocales[regexLocale[1]][0] : 'en_us';
    }

    return locale;
}
