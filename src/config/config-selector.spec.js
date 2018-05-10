import { getConfigState } from './configs.mock';
import { getErrorResponse } from '../common/http-request/responses.mock';
import ConfigSelector from './config-selector';

describe('ConfigSelector', () => {
    let configSelector;
    let state;

    beforeEach(() => {
        state = {
            config: getConfigState(),
        };
    });

    describe('#getConfig()', () => {
        it('returns the current customer', () => {
            configSelector = new ConfigSelector(state.config);

            expect(configSelector.getConfig()).toEqual(state.config.data);
        });
    });

    describe('#getLoadingError()', () => {
        it('returns error if unable to load config', () => {
            const loadError = getErrorResponse();

            configSelector = new ConfigSelector({
                ...state.config,
                errors: { loadError },
            });

            expect(configSelector.getLoadError()).toEqual(loadError);
        });

        it('does not returns error if able to load config', () => {
            configSelector = new ConfigSelector(state.config);

            expect(configSelector.getLoadError()).toBeUndefined();
        });
    });

    describe('#isLoading()', () => {
        it('returns true if loading config', () => {
            configSelector = new ConfigSelector({
                ...state.config,
                statuses: { isLoading: true },
            });

            expect(configSelector.isLoading()).toEqual(true);
        });

        it('returns false if not loading config', () => {
            configSelector = new ConfigSelector(state.config);

            expect(configSelector.isLoading()).toEqual(false);
        });
    });
});
