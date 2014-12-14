// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs     = require("fs")
var path   = require("path")
var assert = require("assert")

var precompute = require("../")


suite("precompute", function() {

  var fixturesDir = "test/fixtures"
  fs.readdirSync(fixturesDir).forEach(function(fixture) {
    test(fixture, function() {
      var expected = require("./expected/" + fixture)
      var dir = path.join(fixturesDir, fixture)
      var actual
      try {
        actual = precompute(dir)
      } catch (error) {
        if (expected instanceof Error) {
          assert.equal(error.name, expected.name)
          assert.equal(error.code, expected.code)
          return
        }
        throw error
      }
      assert.deepEqual(actual, expected)
    })
  })


  test("doesn’t throw on a real module", function() {
    assert.doesNotThrow(precompute.bind(undefined, "."))
  })

})
