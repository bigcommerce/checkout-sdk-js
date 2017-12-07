import ScriptLoader from './script-loader';

describe('ScriptLoader', () => {
    let document;
    let loader;
    let script;

    beforeEach(() => {
        script = {};

        document = {
            createElement: jest.fn(() => script),
            body: {
                appendChild: jest.fn((element) =>
                    element.onreadystatechange(new Event('readystatechange'))
                ),
            },
        };

        loader = new ScriptLoader(document);
    });

    it('attaches script tag to document', async () => {
        await loader.loadScript('https://code.jquery.com/jquery-3.2.1.min.js');

        expect(document.body.appendChild).toHaveBeenCalledWith(script);
        expect(script.src).toEqual('https://code.jquery.com/jquery-3.2.1.min.js');
    });

    it('resolves promise if script is loaded', async () => {
        const output = await loader.loadScript('https://code.jquery.com/jquery-3.2.1.min.js');

        expect(output).toBeInstanceOf(Event);
    });

    it('rejects promise if script is not loaded', async () => {
        jest.spyOn(document.body, 'appendChild').mockImplementation(
            (element) => element.onerror(new Event('error'))
        );

        try {
            await loader.loadScript('https://code.jquery.com/jquery-3.2.1.min.js');
        } catch (output) {
            expect(output).toBeInstanceOf(Event);
        }
    });
});
