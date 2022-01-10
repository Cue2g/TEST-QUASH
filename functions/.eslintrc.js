module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "linebreak-style": 0,
    "max-len": [2, 140, 4, {"ignoreUrls": true}],
  },
};
