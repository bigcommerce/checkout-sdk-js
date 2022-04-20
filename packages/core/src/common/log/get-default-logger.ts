import { getEnvironment } from '../utility';

import createLogger from './create-logger';
import Logger from './logger';

const logger = createLogger(getEnvironment() !== 'test');

export default function getDefaultLogger(): Logger {
    return logger;
}
