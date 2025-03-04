const { defineConfig } = require("cypress");

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3000",
    defaultCommandTimeout: 10000,
  },
};

