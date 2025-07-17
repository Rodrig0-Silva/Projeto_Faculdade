import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";

export default [
  // Configuração Global - Ignora pastas
  {
    ignores: ["node_modules/", "backend/node_modules/", "dist/"],
  },
  
  // Configuração para o Backend (arquivos na pasta 'backend')
  {
    files: ["backend/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Habilita variáveis globais do Node.js, como 'process' e 'require'
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
    },
  },

  // Configuração para o Frontend (arquivos na pasta 'src')
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser, // Habilita variáveis globais do Navegador
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Não precisa de 'import React' em escopo no Vite
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];