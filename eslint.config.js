import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    // Configuración global
    languageOptions: {
      ecmaVersion: 2018, // Equivalente a "ecmaVersion": 2018
    },
    linterOptions: {
      reportUnusedDisableDirectives: true, // Buena práctica para detectar reglas no usadas
    },
    env: {
      es6: true, // Define el entorno ES6
      node: true, // Define el entorno Node.js
    },
    globals: {}, // Define variables globales si es necesario
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-restricted-globals": ["error", "name", "length"],
      "prefer-arrow-callback": "error",
      quotes: ["error", "double", { allowTemplateLiterals: true }],
      "jsx-a11y/alt-text": "off", // Omitir la regla jsx-a11y/alt-text
    },
  },
  {
    // Configuración específica para pruebas
    files: ["**/*.spec.*"], // Archivos que terminan en .spec.*
    env: {
      mocha: true, // Define el entorno Mocha
    },
    rules: {
      // Puedes agregar reglas específicas para estos archivos aquí
    },
  },
];
