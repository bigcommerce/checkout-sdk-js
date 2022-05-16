module.exports = {
  "extends": [
    "../../.eslintrc.json"
  ],
  "parserOptions": {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
    "ecmaFeatures": {
        "modules": true
    },
    "ecmaVersion": 6,
    "sourceType": "module"
  },
}
