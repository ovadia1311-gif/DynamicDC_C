export { };

declare global {
    interface Window {
        __CONFIG?: {
            ApiUrl?: string;
        }
    }
}