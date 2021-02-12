/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
    preset:            'ts-jest',
    testEnvironment:   'node',
    collectCoverage:   true,
    coverageDirectory: 'coverage'
}
