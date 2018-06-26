export default function getEnvironment(): string {
    try {
        return process.env.NODE_ENV || 'development';
    } catch (e) {
        return 'development';
    }
}
