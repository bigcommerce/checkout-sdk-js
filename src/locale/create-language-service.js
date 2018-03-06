import { createLogger } from './common/log';
import LanguageService from './locale/language-service';

/**
 * @param {LanguageConfig} [config={}]
 * @return {CheckoutLegacyServices}
 */
export default function createLanguageService(config = {}) {
    return new LanguageService(
        config,
        createLogger(process.env.NODE_ENV !== 'test')
    );
}
