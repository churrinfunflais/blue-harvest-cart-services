import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import promisePlugin from 'eslint-plugin-promise';
import securityPlugin from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            promise: promisePlugin,
            security: securityPlugin,
        },
        rules: {
            ...promisePlugin.configs.recommended.rules,
            ...securityPlugin.configs.recommended.rules,
            'security/detect-object-injection': 'off',
        },
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            'sort-keys-fix': sortKeysFix,
        },
        rules: {
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                    allowTaggedTemplates: false,
                    enforceForJSX: false,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'sort-keys-fix/sort-keys-fix': 'warn',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
        },
    },
    {
        ignores: ['node_modules/', 'dist/', '.env', 'eslint.config.js', '.sdk'],
    },
    eslintConfigPrettier
);
