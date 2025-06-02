export class WorkerEventPoster<TEvent, TContext = undefined> {
    constructor(private _worker: Worker, private _context: TContext) {}

    post(event: TEvent): void {
        if (!this._worker) {
            throw new Error(
                'WorkerPoster: Worker is not initialized or creation failed. Cannot post message.',
            );
        }

        this._worker.postMessage({ ...event, context: this._context });
    }
}
