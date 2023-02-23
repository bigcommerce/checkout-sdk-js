import localStorageFallback from 'local-storage-fallback';

import { DigitalItem, PhysicalItem } from '@bigcommerce/checkout-sdk/payment-integration-api';

import AnalyticsExtraItemsManager from './analytics-extra-items-manager';
import { ExtraItemsData } from './extra-items-data';

describe('AnalyticsExtraItemsManager', () => {
    it('save extra items data', () => {
        const resultExtraItemsData: ExtraItemsData = {
            1: {
                brand: 'brand1',
                category: 'category1, category2',
            },
            2: {
                brand: '',
                category: '',
            },
        };
        const setItemMock = jest.fn((id: string, result: { [key: string]: unknown }) => ({
            id,
            result,
        }));
        const localStorageFallbackMock = {
            ...localStorageFallback,
            setItem: setItemMock,
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const resultData = analyticsExtraItemsManager.saveExtraItemsData('dataId', {
            physicalItems: [
                {
                    productId: 1,
                    brand: 'brand1',
                    categoryNames: ['category1', 'category2'],
                },
            ] as PhysicalItem[],
            digitalItems: [
                {
                    productId: 2,
                },
            ] as DigitalItem[],
            giftCertificates: [],
        });

        expect(resultData).toEqual(resultExtraItemsData);
        expect(setItemMock).toHaveBeenCalledWith(
            'ORDER_ITEMS_dataId',
            JSON.stringify(resultExtraItemsData),
        );
    });

    it('catch error after try save extra items data', () => {
        const localStorageFallbackMock = {
            ...localStorageFallback,
            setItem: jest.fn(() => {
                throw new Error();
            }),
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const resultData = analyticsExtraItemsManager.saveExtraItemsData('dataId', {
            physicalItems: [
                {
                    productId: 1,
                    brand: 'brand1',
                    categoryNames: ['category1', 'category2'],
                },
            ] as PhysicalItem[],
            digitalItems: [
                {
                    productId: 2,
                },
            ] as DigitalItem[],
            giftCertificates: [],
        });

        expect(resultData).toEqual({});
    });

    it('read extra items data', () => {
        const getItemMock = jest.fn(
            () => `{"product": {"brand": "brand1", "category": "category1, category2"}}`,
        );
        const localStorageFallbackMock = {
            ...localStorageFallback,
            getItem: getItemMock,
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const readResult = analyticsExtraItemsManager.readExtraItemsData('dataId');

        expect(getItemMock).toHaveBeenCalledWith('ORDER_ITEMS_dataId');
        expect(readResult).toEqual({
            product: {
                brand: 'brand1',
                category: 'category1, category2',
            },
        });
    });

    it('read empty extra items data', () => {
        const localStorageFallbackMock = {
            ...localStorageFallback,
            getItem: jest.fn(() => undefined),
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const readResult = analyticsExtraItemsManager.readExtraItemsData('dataId');

        expect(readResult).toBeNull();
    });

    it('read incorrect items data', () => {
        const getItemMock = jest.fn(() => '123');
        const localStorageFallbackMock = {
            ...localStorageFallback,
            getItem: getItemMock,
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const readResult = analyticsExtraItemsManager.readExtraItemsData('dataId');

        expect(getItemMock).toHaveBeenCalledWith('ORDER_ITEMS_dataId');
        expect(readResult).toBeNull();
    });

    it('read items data with missed options fro ExtraItemsData', () => {
        const getItemMock = jest.fn(() => `{"product": {"brand": "brand1"}}`);
        const localStorageFallbackMock = {
            ...localStorageFallback,
            getItem: getItemMock,
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const readResult = analyticsExtraItemsManager.readExtraItemsData('dataId');

        expect(getItemMock).toHaveBeenCalledWith('ORDER_ITEMS_dataId');
        expect(readResult).toBeNull();
    });

    it('catch error while read extra items data', () => {
        const localStorageFallbackMock = {
            ...localStorageFallback,
            getItem: jest.fn(() => {
                throw new Error();
            }),
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        const readResult = analyticsExtraItemsManager.readExtraItemsData('dataId');

        expect(readResult).toBeNull();
    });

    it('clear extra items data', () => {
        const removeItemMock = jest.fn((id: string) => id);
        const localStorageFallbackMock = {
            ...localStorageFallback,
            removeItem: removeItemMock,
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        analyticsExtraItemsManager.clearExtraItemData('dataId');

        expect(removeItemMock).toHaveBeenCalledWith('ORDER_ITEMS_dataId');
    });

    it('clear extra items data by empty id', () => {
        const removeItemMock = jest.fn((id: string) => id);
        const localStorageFallbackMock = {
            ...localStorageFallback,
            removeItem: removeItemMock,
        };

        const analyticsExtraItemsManager = new AnalyticsExtraItemsManager(localStorageFallbackMock);

        analyticsExtraItemsManager.clearExtraItemData('');

        expect(removeItemMock).toHaveBeenCalledWith('');
    });
});
