#!/usr/bin/env node
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var precompute = require("./")

var dir  = process.argv[2] || "."
var data = precompute(dir)
process.stdout.write(JSON.stringify(data, null, 2))
