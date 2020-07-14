import { CancellablePromise } from '../utility';

import { UnexpectedDetachmentError } from './errors';
import { MutationObserverFactory } from './mutation-observer';

export default class DetachmentObserver {
    constructor(
        private _mutationObserver: MutationObserverFactory
    ) {}

    async ensurePresence<T>(targets: Node[], promise: Promise<T>): Promise<T> {
        const cancellable = new CancellablePromise(promise);

        const observer = this._mutationObserver.create(mutationsList => {
            mutationsList.forEach(mutation => {
                const removedTargets = Array.from(mutation.removedNodes)
                    .filter(node =>
                        targets.some(target =>
                            node === target || node.contains(target)
                        )
                    );

                if (removedTargets.length === 0) {
                    return;
                }

                cancellable.cancel(new UnexpectedDetachmentError());
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        try {
            const output = await cancellable.promise;

            observer.disconnect();

            return output;
        } catch (error) {
            observer.disconnect();

            throw error;
        }
    }
}
