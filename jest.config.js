
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: [
        "**/*.{js,jsx,ts,tsx}",
        "**/node_modules/automatons",
    ],
    coveragePathIgnorePatterns: [],
    env: {
        test: {
            plugins: [
                ["istanbul", {
                    "exclude": [
                        "!**/node_modules/**",
                        "**/tests/**"
                    ]
                }]
            ]
        }
    }
};
