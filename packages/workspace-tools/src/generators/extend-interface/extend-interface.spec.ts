import path from 'path';

import extendInterface from './extend-interface';

describe('extendInterface', () => {
    it('extends interface with other matching interfaces', async () => {
        const options = {
            inputPath: path.join(__dirname, '/__fixtures__/**/index.ts'),
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            outputMemberName: 'ExtendedInterface',
            memberPattern: '^Interface.$',
            targetPath: path.join(__dirname, '/__fixtures__/foobar-interface/index.ts'),
            targetMemberName: 'FoobarInterface',
        };

        expect(await extendInterface(options)).toMatchSnapshot();
    });

    it('handles scenario where no matching interface is found', async () => {
        const options = {
            inputPath: path.join(__dirname, '/__fixtures__/**/index.ts'),
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            outputMemberName: 'ExtendedDummyInterface',
            memberPattern: '^DummyInterface.$',
            targetPath: path.join(__dirname, '/__fixtures__/foobar-interface/index.ts'),
            targetMemberName: 'FoobarInterface',
        };

        expect(await extendInterface(options)).toMatchSnapshot();
    });
});
