import CancellablePromise from './cancellable-promise';

describe('CancellablePromise', () => {
    it('resolves with the value of the promise if it was already resolved', async () => {
        const element = { data: 'here' };
        const cancellable = new CancellablePromise(Promise.resolve(element));
        // Makes sure we don't tamper with the promise
        const { promise } = cancellable;

        await expect(promise).resolves.toBe(element);
    });

    it('cancels the promise when cancel is called', async () => {
        const cancellable = new CancellablePromise(new Promise(() => { }));
        const error = new Error('Just because!');
        // Makes sure we don't tamper with the promise.
        const { promise } = cancellable;

        cancellable.cancel(error);

        await expect(promise).rejects.toEqual(error);
    });
});
