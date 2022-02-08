const fs = require("fs");
const Osz2 = require("../lib/osz2/Osz2");

let osz2 = new Osz2(__dirname + "/test.osz2");

osz2.parse();