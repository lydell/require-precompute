// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var fs   = require("fs")
var path = require("path")

var has = Function.prototype.call.bind(Object.prototype.hasOwnProperty)

function precompute(dir) {
  var tree = parseDirRecursive(dir)
  var result = {}

  ;(function recurse(module) {
    var data = precomputeModule(module)
    if (data) {
      result[calculatePath(module)] = data
    }
    Object.keys(module.node_modules).forEach(function(childModuleName) {
      recurse(module.node_modules[childModuleName])
    })
  }(tree))

  return result
}

function parseDirRecursive(dir, parent, name) {
  var module = {
    package: null,
    node_modules: {},
    parent: parent,
    name: name
  }

  var packagePath = path.join(dir, "package.json")
  if (fs.existsSync(packagePath)) {
    module.package = JSON.parse(fs.readFileSync(packagePath).toString())
  }

  var modulesDir = path.join(dir, "node_modules")
  if (fs.existsSync(modulesDir)) {
    var names = fs.readdirSync(modulesDir)
    if (module.package) {
      names = names.filter(has.bind(null, module.package.dependencies || {}))
    }
    names.forEach(function(name) {
      module.node_modules[name] =
        parseDirRecursive(path.join(modulesDir, name), module, name)
    })
  }

  return module
}

function precomputeModule(module) {
  var data = {}
  var needed = false

  if (!module.package) {
    return null
  }

  var main = path.normalize(module.package.main || "index").replace(/\.js$/, "")
  if (main !== "index") {
    data[""] = main
    needed = true
  }

  var dependencies = module.package.dependencies
  if (dependencies) {
    Object.keys(dependencies).forEach(function(name) {
      if (!has(module.node_modules, name)) {
        data[name] = lookup(module, name)
        needed = true
      }
    })
  }

  return (needed ? data : null)
}

function calculatePath(module) {
  var pathParts = []
  var parent = module
  do {
    pathParts.unshift(parent.name)
  } while ((parent = parent.parent))
  return "." + pathParts.join("/node_modules/")
}

function lookup(module, name) {
  var parent = module
  while ((parent = parent.parent)) {
    if (has(parent.node_modules, name)) {
      return calculatePath(parent)
    }
  }
  // Mimic the error thrown by `require` when a module isn’t found.
  var error = new Error("Cannot find module '" + name + "'")
  error.code = "MODULE_NOT_FOUND"
  throw error
}

module.exports = precompute
