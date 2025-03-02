const { defineConfig } = require("cypress");

module.exports = {
  e2e: {
    baseUrl: "http://localhost:3001",
    defaultCommandTimeout: 10000,
  },
};

