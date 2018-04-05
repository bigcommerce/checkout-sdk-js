export default class CancellablePromise<T> {
    promise: Promise<T>;
    cancel!: (reason?: any) => any;

    constructor(promise: Promise<T>) {
        const cancellable = new Promise<T>((resolve, reject) => {
            this.cancel = reject;
        });

        this.promise = Promise.race([promise, cancellable]) as Promise<T>;
    }
}
