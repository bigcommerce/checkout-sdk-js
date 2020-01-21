declare const LIBRARY_NAME: string;
declare const MANIFEST_JSON: AssetManifest;

interface AssetManifest {
    version: string;
    js: string[];
}
