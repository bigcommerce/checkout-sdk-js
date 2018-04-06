import { createLogger } from '../common/log';

import LanguageConfig from './language-config';
import LanguageService from './language-service';

export default function createLanguageService(config: Partial<LanguageConfig> = {}): LanguageService {
    return new LanguageService(
        config,
        createLogger(process.env.NODE_ENV !== 'test')
    );
}
