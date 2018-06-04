export default function getEnvironment() {
    try {
        return process.env.NODE_ENV || 'development';
    } catch (e) {
        return 'development';
    }
}
