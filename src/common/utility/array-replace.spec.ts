import arrayReplace from './array-replace';

describe('arrayReplace()', () => {
    it('replaces current array with new array if they are different', () => {
        const currentArray = [1, 2];
        const newArray = [3, 4];
        const result = arrayReplace(currentArray, newArray);

        expect(result)
            .toBe(newArray);
    });

    it('retains current array if new array is same as current array', () => {
        const currentArray = [1, 2];
        const newArray = [1, 2];
        const result = arrayReplace(currentArray, newArray);

        expect(result)
            .toBe(currentArray);
    });

    it('recursively retains current array if new array is same as current array', () => {
        const currentArray = [1, ['a', 'b']];
        const newArray = [2, ['a', 'b']];
        const result = arrayReplace(currentArray, newArray);

        expect(result)
            .toEqual([2, ['a', 'b']]);
        expect(result[1])
            .toBe(currentArray[1]);
    });

    it('retains entity in current array if it is same as entity in new array in same position', () => {
        const currentArray = [{ id: 1 }, { id: 2 }];
        const newArray = [{ id: 1 }, { id: 3 }];
        const result = arrayReplace(currentArray, newArray);

        expect(result)
            .toEqual([{ id: 1 }, { id: 3 }]);
        expect(result[0])
            .toBe(currentArray[0]);
        expect(result[1])
            .toBe(newArray[1]);
    });

    it('recursively retains entity in current array if it is same as entity in new array in same position', () => {
        const currentArray = [{ id: 1 }, { id: 2, items: [{ id: 'a' }, { id: 'b' }] }];
        const newArray = [{ id: 3 }, { id: 2, items: [{ id: 'a' }, { id: 'c' }] }];
        const result = arrayReplace(currentArray, newArray);

        expect(result).toEqual([{ id: 3 }, { id: 2, items: [{ id: 'a' }, { id: 'c' }] }]);
        // tslint:disable-next-line:no-non-null-assertion
        expect(result[1].items![0]).toBe(currentArray[1].items![0]);
    });

    it('uses custom matcher to match objects between arrays', () => {
        const currentArray = [{ identifier: 1 }, { identifier: 2 }];
        const newArray = [{ identifier: 1 }, { identifier: 3 }];
        const result = arrayReplace(currentArray, newArray, {
            matchObject: (a, b) => a.identifier === b.identifier,
        });

        expect(result)
            .toEqual([{ identifier: 1 }, { identifier: 3 }]);
        expect(result[0])
            .toBe(currentArray[0]);
        expect(result[1])
            .toBe(newArray[1]);
    });

    it('handles nested collections of objects', () => {
        const currentArray = [
            {
                id: '5d49eb3897a7d',
                shippingCost: 0,
                handlingCost: 0,
                couponDiscounts: [],
                discounts: [],
                lineItemIds: [
                    '5193c8b5-752a-4369-aeb4-53f881871aa2',
                    '0aa305d8-3549-4a96-94e7-8c2ee0f3c23b',
                ],
                shippingAddress: {
                    firstName: 'Good',
                    lastName: 'Shopper',
                    email: '',
                    company: 'BigShopper',
                    address1: '685 Market St',
                    address2: '',
                    city: 'San Francisco',
                    stateOrProvince: 'California',
                    stateOrProvinceCode: 'CA',
                    country: 'United States',
                    countryCode: 'US',
                    postalCode: '94105',
                    phone: '5677891234',
                    customFields: [],
                },
                availableShippingOptions: [],
            },
        ];

        const newArray = [
            {
                id: '5d49eb3897a7d',
                shippingCost: 0,
                handlingCost: 0,
                couponDiscounts: [],
                discounts: [],
                lineItemIds: [
                    '5193c8b5-752a-4369-aeb4-53f881871aa2',
                    '0aa305d8-3549-4a96-94e7-8c2ee0f3c23b',
                ],
                shippingAddress: {
                    firstName: 'Good',
                    lastName: 'Shopper',
                    email: '',
                    company: 'BigShopper',
                    address1: '685 Market St',
                    address2: '',
                    city: 'San Francisco',
                    stateOrProvince: 'California',
                    stateOrProvinceCode: 'CA',
                    country: 'United States',
                    countryCode: 'US',
                    postalCode: '94105',
                    phone: '5677891234',
                    customFields: [],
                },
                availableShippingOptions: [
                    {
                        id: '4dcbf24f457dd67d5f89bcf374e0bc9b',
                        type: 'freeshipping',
                        description: 'Free Shipping',
                        imageUrl: '',
                        cost: 0,
                        transitTime: '',
                        isRecommended: true,
                        additionalDescription: '',
                    },
                ],
            },
        ];

        const result = arrayReplace(currentArray, newArray);

        expect(result)
            .toEqual(newArray);
        expect(result[0].shippingAddress)
            .toBe(currentArray[0].shippingAddress);
        expect(result[0].lineItemIds)
            .toBe(currentArray[0].lineItemIds);
        expect(result[0].availableShippingOptions)
            .toBe(newArray[0].availableShippingOptions);
    });
});
