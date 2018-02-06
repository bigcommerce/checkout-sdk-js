export default class ScriptLoader {
    constructor(
        private _document: Document
    ) {}

    loadScript(src: string): Promise<Event> {
        return new Promise((resolve, reject) => {
            const script = this._document.createElement('script') as LegacyHTMLScriptElement;

            script.onload = (event) => resolve(event);
            script.onreadystatechange = (event) => resolve(event);
            script.onerror = (event) => reject(event);
            script.async = true;
            script.src = src;

            this._document.body.appendChild(script);
        });
    }
}

interface LegacyHTMLScriptElement extends HTMLScriptElement {
    // `onreadystatechange` is needed to support legacy IE
    onreadystatechange: (this: HTMLElement, event: Event) => any;
}
