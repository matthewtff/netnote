'use strict'

var path = require('path');

module.exports = {
  context: __dirname,
  entry: {
    netnote: "./build/netnote"
  },
  "output": {
    path: path.join(__dirname, "js"),
    filename: "[name].js"
  }
}
