export default function toFormUrlEncoded(data: { [key: string]: object | string | undefined }): string {
    return Object.keys(data)
        .filter(key => data[key] !== undefined)
        .map(key => {
            const value = data[key];

            if (typeof value === 'string') {
                return `${key}=${encodeURIComponent(value)}`;
            }

            return `${key}=${encodeURIComponent(JSON.stringify(value) || '')}`;
        })
        .join('&');
}
