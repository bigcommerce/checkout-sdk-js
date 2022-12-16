import path from 'path';

import createEnum from './create-enum';

describe('createEnum()', () => {
    it('export matching members from files to another file', async () => {
        const options = {
            inputPaths: [path.join(__dirname, '/__fixtures__/**/index.ts')],
            inputMemberPattern: '^Type.+',
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            outputMemberName: 'Type',
        };

        expect(await createEnum(options)).toMatchSnapshot();
    });

    it('handles scenario where no matching member is found', async () => {
        const options = {
            inputPaths: [path.join(__dirname, '/__fixtures__/**/index.ts')],
            inputMemberPattern: '^Test',
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            outputMemberName: 'Type',
        };

        expect(await createEnum(options)).toMatchSnapshot();
    });
});
