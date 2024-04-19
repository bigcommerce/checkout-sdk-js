import objectFlatten from './object-flatten';

const testObject = {
    consignmentId: '55c96cda6f04c',
    searchArea: {
        radius: {
            value: 1.4,
            unit: 0,
        },
        coordinates: {
            latitude: 1.4,
            longitude: 1.4,
        },
    },
};

describe('objectFlatten()', () => {
    it('flattens a nested object', () => {
        const newValue = {
            consignmentId: '55c96cda6f04c',
            'searchArea.radius.value': 1.4,
            'searchArea.radius.unit': 0,
            'searchArea.coordinates.latitude': 1.4,
            'searchArea.coordinates.longitude': 1.4,
        };

        const result = objectFlatten(testObject);

        expect(result).toEqual(newValue);
    });
});
