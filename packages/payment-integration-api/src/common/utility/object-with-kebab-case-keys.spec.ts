import objectWithKebabCaseKeys from './object-with-kebab-case-keys';

const objectMock = {
    camelCaseValue: 'test',
    undefinedValue: undefined,
    falsyValue: false,
};

describe('objectWithKebabCaseKeys()', () => {
    it('returns object with kebab keys', () => {
        const expectedObject = {
            'camel-case-value': 'test',
            'undefined-value': undefined,
            'falsy-value': false,
        };

        const result = objectWithKebabCaseKeys(objectMock);

        expect(result).toEqual(expectedObject);
    });
});
