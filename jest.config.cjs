    // jest.config.js
    module.exports = {
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    slowTestThreshold: 12, // segundos antes de marcar en rojo
    
    moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    };
