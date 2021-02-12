/**
 * @type {import("@types/eslint")}
 */
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
    },
    plugins: [
        "@typescript-eslint"
    ],
    env: {
        es6: true,
        node: true,
        browser: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    rules: {
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "error",
        "@typescript-eslint/prefer-regexp-exec": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "array-bracket-spacing": ["error", "always", {
            "objectsInArrays": false,
            "arraysInArrays": false,
        }],
        "array-element-newline": ["error", "consistent"],
        "comma-style": "error",
        "indent": ["error", 4],
        "jsx-quotes": ["error", "prefer-double"],
        "key-spacing": ["error", { "align": "value" }],
        "no-fallthrough": "warn",
        "object-curly-spacing": ["error", "always"],
        "object-property-newline": ["error", { "allowAllPropertiesOnSameLine": true }],
        "quotes": ["error", "double"],
        "semi": ["error", "never"],
        "sort-imports": ["error", { "ignoreDeclarationSort": true }],
        "space-infix-ops": "error",
        "spaced-comment": ["error", "always", {
            "exceptions": ["-", "-", "*"]
        }],
        "quotes": ["error", "single"]
    },
    overrides: [
        {
            files: ["src/**/*.js?(x)"],
            rules: {
                "@typescript-eslint/explicit-module-boundary-types": "off",
            }
        },
        {
            files: ["src/**/*.ts?(x)"],
            rules: {
                // Add overrides here
            },
        },
    ],
};
