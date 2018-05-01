export default class CancellablePromise<T> {
    promise: Promise<T>;
    cancel!: (reason?: any) => void;

    constructor(promise: Promise<T>) {
        const cancellable = new Promise<T>((resolve, reject) => {
            this.cancel = reject;
        });

        this.promise = Promise.race([promise, cancellable]);
    }
}
