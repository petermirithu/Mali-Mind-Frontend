module.exports = function (api:any) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'react-native-reanimated/plugin', {
                relativeSourceLocation: true,
                },
            ],
            [
                "module:react-native-dotenv",
                {
                "moduleName": "react-native-dotenv",          
                "path": ".env",
                "blocklist": null,
                "allowlist": null,
                "safe": false,
                "allowUndefined": true,
                "verbose": false
                }
            ],
        ],
    };
};