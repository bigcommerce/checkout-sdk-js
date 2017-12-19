/**
 * @param {string} type
 * @param {string} title
 * @return {Response<ErrorResponseBody>}
 */
export default function createClientError(type, title) {
    return {
        body: {
            type,
            title,
        },
    };
}
