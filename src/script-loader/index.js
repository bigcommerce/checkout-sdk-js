import ScriptLoader from './script-loader';

/**
 * @return {ScriptLoader}
 */
export function createScriptLoader() {
    return new ScriptLoader(document);
}
