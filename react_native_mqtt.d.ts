declare module 'react_native_mqtt' {
    interface InitOptions {
        size: number;
        storageBackend: any;
        defaultExpires: number;
        enableCache: boolean;
        sync: object;
    }
    
    function init(options: InitOptions): void;

    export { init };
}

