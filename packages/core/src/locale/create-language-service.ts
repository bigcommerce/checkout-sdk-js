import { getDefaultLogger } from '../common/log';

import LanguageConfig from './language-config';
import LanguageService from './language-service';

/**
 * Creates an instance of `LanguageService`.
 *
 * @remarks
 * ```js
 * const language = {{{langJson 'optimized_checkout'}}}; // `langJson` is a Handlebars helper provided by BigCommerce's Stencil template engine.
 * const service = createLanguageService(language);
 *
 * console.log(service.translate('address.city_label'));
 * ```
 *
 * @param config - A configuration object.
 * @returns An instance of `LanguageService`.
 */
export default function createLanguageService(config: Partial<LanguageConfig> = {}): LanguageService {
    return new LanguageService(
        config,
        getDefaultLogger()
    );
}
