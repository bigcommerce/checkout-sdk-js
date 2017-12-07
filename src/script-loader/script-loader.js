export default class ScriptLoader {
    /**
     * @constructor
     * @param {Document} document
     */
    constructor(document) {
        this._document = document;
    }

    /**
     * @param {string} src
     * @return {Promise<Event>}
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = this._document.createElement('script');

            script.onload = (event) => resolve(event);
            script.onreadystatechange = (event) => resolve(event);
            script.onerror = (event) => reject(event);
            script.async = true;
            script.src = src;

            this._document.body.appendChild(script);
        });
    }
}
