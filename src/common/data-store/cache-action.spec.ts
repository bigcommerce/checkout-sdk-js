import { createAction, createDataStore } from '@bigcommerce/data-store';
import { defer } from 'rxjs';

import cacheAction from './cache-action';

describe('cacheAction()', () => {
    it('returns observable action that emits cached value', async () => {
        const getMessage = jest.fn(() => Promise.resolve(createAction('GET_MESSAGE', 'Hello world')));
        const subscriber = jest.fn();
        const createCachedAction = cacheAction(() => defer(() => getMessage()));

        createCachedAction().subscribe(subscriber);
        createCachedAction().subscribe(subscriber);

        await new Promise(resolve => process.nextTick(resolve));

        expect(subscriber).toHaveBeenCalledWith(createAction('GET_MESSAGE', 'Hello world'));
        expect(subscriber).toHaveBeenCalledTimes(2);
        expect(getMessage).toHaveBeenCalledTimes(1);
    });

    it('caches emitted values from observable action based on parameters', async () => {
        const getMessage = jest.fn(name => Promise.resolve(createAction('GET_MESSAGE', `Hello ${name}`)));
        const subscriber = jest.fn();
        const createCachedAction = cacheAction(name => defer(() => getMessage(name)));

        createCachedAction('Foo').subscribe(subscriber);
        createCachedAction('Foo').subscribe(subscriber);
        createCachedAction('Bar').subscribe(subscriber);
        createCachedAction('Bar').subscribe(subscriber);

        await new Promise(resolve => process.nextTick(resolve));

        expect(subscriber).toHaveBeenCalledWith(createAction('GET_MESSAGE', 'Hello Foo'));
        expect(subscriber).toHaveBeenCalledWith(createAction('GET_MESSAGE', 'Hello Bar'));
        expect(subscriber).toHaveBeenCalledTimes(4);
        expect(getMessage).toHaveBeenCalledWith('Foo');
        expect(getMessage).toHaveBeenCalledWith('Bar');
        expect(getMessage).toHaveBeenCalledTimes(2);
    });

    it('returns thunk action that emits cached value', async () => {
        const getMessage = jest.fn(() => Promise.resolve(createAction('GET_MESSAGE', 'Hello world')));
        const subscriber = jest.fn();
        const createCachedAction = cacheAction(() => store => defer(() => getMessage()));
        const store = createDataStore(state => state);

        createCachedAction()(store).subscribe(subscriber);
        createCachedAction()(store).subscribe(subscriber);

        await new Promise(resolve => process.nextTick(resolve));

        expect(subscriber).toHaveBeenCalledWith(createAction('GET_MESSAGE', 'Hello world'));
        expect(subscriber).toHaveBeenCalledTimes(2);
        expect(getMessage).toHaveBeenCalledTimes(1);
    });

    it('caches emitted values from thunk action based on parameters', async () => {
        const getMessage = jest.fn(name => Promise.resolve(createAction('GET_MESSAGE', `Hello ${name}`)));
        const subscriber = jest.fn();
        const createCachedAction = cacheAction(name => store => defer(() => getMessage(name)));
        const store = createDataStore(state => state);

        createCachedAction('Foo')(store).subscribe(subscriber);
        createCachedAction('Foo')(store).subscribe(subscriber);
        createCachedAction('Bar')(store).subscribe(subscriber);
        createCachedAction('Bar')(store).subscribe(subscriber);

        await new Promise(resolve => process.nextTick(resolve));

        expect(subscriber).toHaveBeenCalledWith(createAction('GET_MESSAGE', 'Hello Foo'));
        expect(subscriber).toHaveBeenCalledWith(createAction('GET_MESSAGE', 'Hello Bar'));
        expect(subscriber).toHaveBeenCalledTimes(4);
        expect(getMessage).toHaveBeenCalledWith('Foo');
        expect(getMessage).toHaveBeenCalledWith('Bar');
        expect(getMessage).toHaveBeenCalledTimes(2);
    });
});
