import { selector } from '../common/selector';

import Config, { StoreConfig } from './config';
import ConfigState from './config-state';

@selector
export default class ConfigSelector {
    constructor(
        private _config: ConfigState
    ) {}

    getConfig(): Config | undefined {
        return this._config.data;
    }

    getStoreConfig(): StoreConfig | undefined {
        return this._config.data && this._config.data.storeConfig;
    }

    getLoadError(): Error | undefined {
        return this._config.errors.loadError;
    }

    isLoading(): boolean {
        return !!this._config.statuses.isLoading;
    }
}
