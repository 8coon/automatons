module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverageFrom: ["<rootDir>/tmp/**/*.js"],
    coverageThreshold: {
        global: {
            branches: 68,
            functions: 96,
            lines: 98,
            statements: 98,
        }
    },
    moduleNameMapper: {
        "^automatons$": "<rootDir>/tmp/automatons/dist/automatons.min.js",
    }
};
