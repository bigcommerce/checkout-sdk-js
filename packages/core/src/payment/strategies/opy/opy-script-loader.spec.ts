import { createScriptLoader, ScriptLoader } from '@bigcommerce/script-loader';

import { PaymentMethodClientUnavailableError } from '../../errors';

import { OpyHostWindow, OpyRegion, OpyWidget } from './opy-library';
import OpyScriptLoader from './opy-script-loader';

describe('OpyScriptLoader', () => {
    let scriptLoader: ScriptLoader;
    let opyWindow: OpyHostWindow;
    let opyScriptLoader: OpyScriptLoader;
    let opyLibraryMock: OpyWidget;

    beforeEach(() => {
        scriptLoader = createScriptLoader();
        opyWindow = window;
        opyScriptLoader = new OpyScriptLoader(scriptLoader, opyWindow);
        opyLibraryMock = { Config: jest.fn() };

        jest.spyOn(scriptLoader, 'loadScript').mockImplementation(() => {
            opyWindow.OpenpayWidgets = opyLibraryMock;

            return Promise.resolve();
        });
    });

    describe('#loadOpyWidgets', () => {
        it('loads default widget script', async () => {
            await expect(opyScriptLoader.loadOpyWidget()).resolves.toEqual(opyLibraryMock);

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                'https://widgets.openpay.com.au/lib/openpay-widgets.min.js',
            );
        });

        it('loads widget script for USA', async () => {
            await expect(opyScriptLoader.loadOpyWidget(OpyRegion.US)).resolves.toEqual(
                opyLibraryMock,
            );

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                'https://widgets.opy.com/lib/openpay-widgets.min.js',
            );
        });

        it('loads widget script for different region', async () => {
            await expect(opyScriptLoader.loadOpyWidget(OpyRegion.UK)).resolves.toEqual(
                opyLibraryMock,
            );

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                'https://widgets.openpay.com.au/lib/openpay-widgets.min.js',
            );
        });

        it('fails to load widget script', async () => {
            jest.spyOn(scriptLoader, 'loadScript').mockImplementationOnce(() => {
                delete opyWindow.OpenpayWidgets;

                return Promise.resolve();
            });

            await expect(opyScriptLoader.loadOpyWidget()).rejects.toThrow(
                PaymentMethodClientUnavailableError,
            );

            expect(scriptLoader.loadScript).toHaveBeenCalledWith(
                'https://widgets.openpay.com.au/lib/openpay-widgets.min.js',
            );
        });
    });
});
