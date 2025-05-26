import { WorkerEventPoster } from '../common/worker';

import { ExtensionMessage } from './extension-message';

export class WorkerExtensionMessenger {
    private _workers: { [extensionId: string]: Worker };

    constructor() {
        this._workers = {};
    }

    add(extensionId: string, worker: Worker): void {
        this._workers[extensionId] = worker;
    }

    post(extensionId: string, message: ExtensionMessage): void {
        if (!this._workers[extensionId]) {
            throw new Error(`Worker with extensionId ${extensionId} not found`);
        }

        const workerPoster = new WorkerEventPoster(this._workers[extensionId], extensionId);

        workerPoster.post(message);
    }

    clearCacheById(extensionId: string): void {
        delete this._workers[extensionId];
    }
}
