import { selector } from '../common/selector';

import { StoreConfig } from './config';
import ConfigState from './config-state';

@selector
export default class ConfigSelector {
    constructor(
        private _config: ConfigState
    ) {}

    getConfig(): StoreConfig | undefined {
        return this._config.data;
    }

    getLoadError(): Error | undefined {
        return this._config.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._config.statuses.isLoading;
    }
}
