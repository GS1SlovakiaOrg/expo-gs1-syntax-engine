const { defineConfig } = require('eslint/config');
const universe = require('eslint-config-universe/flat/native');
const universeWeb = require('eslint-config-universe/flat/web');

module.exports = defineConfig([
    {
        ignores: ['build'],
        extends: '@react-native-community',
        rules: { 'prettier/prettier': 0 }
    }, ...universe, ...universeWeb]);
