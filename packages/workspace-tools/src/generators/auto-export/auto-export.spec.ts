import path from 'path';

import autoExport from './auto-export';

describe('autoExport()', () => {
    it('export matching members from files to another file', async () => {
        const options = {
            inputPath: path.join(__dirname, '/__fixtures__/**/index.ts'),
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            memberPattern: '^Strategy',
            packageOutputPath: path.join(__dirname, '/__temp__/<moduleName>/output.ts'),
            apiExtractorConfig: {
                entryPointSourceFile: '/__temp__/<moduleName>/index.d.ts',
                mainDtsRollupPath: '/__temp__/<moduleName>.d.ts',
            },
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });

    it('handles scenario where no matching member is found', async () => {
        const options = {
            inputPath: path.join(__dirname, '/__fixtures__/**/index.ts'),
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            memberPattern: '^Test',
            packageOutputPath: path.join(__dirname, '/__temp__/<moduleName>/output.ts'),
            apiExtractorConfig: {
                entryPointSourceFile: '/__temp__/<moduleName>/index.d.ts',
                mainDtsRollupPath: '/__temp__/<moduleName>.d.ts',
            },
        };

        expect(await autoExport(options)).toMatchSnapshot();
    });
});
