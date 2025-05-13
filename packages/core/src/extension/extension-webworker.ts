/* eslint-disable no-console */
export class ExtensionWebWorker {
    private worker: Worker;

    constructor(url: string) {
        if (!window.Worker) {
            throw new Error(
                `Unable to load the extension's web worker: your browser does not support Web Workers.`,
            );
        }

        const blob = URL.createObjectURL(
            new Blob(
                [
                    `importScripts=((i)=>(...a)=>i(...a.map((u)=>''+new URL(u,"${url}"))))(importScripts);importScripts("${url}")`,
                ],
                { type: 'text/javascript' },
            ),
        );

        this.worker = new Worker(blob);

        // Code below is temporary
        try {
            this.worker.onmessage = (event) => {
                console.log('Host got message:', event.data);
            };

            this.worker.onerror = (error) => {
                console.error('Main Script: Worker error:', error.message);
            };

            this.worker.postMessage('hello world');
        } catch (e: any) {
            console.error('Main Script: Failed during worker/observer setup.', e);
        }
    }

    // TODO: handleMessageFromWorker() - handle messages from the worker
    // TODO: postMessageToWorker() - send a message to the worker
    // TODO: terminate() - terminate the worker
}
