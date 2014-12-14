Overview [![Build Status](https://travis-ci.org/lydell/require-precompute.svg?branch=master)](https://travis-ci.org/lydell/require-precompute)
========

Creating a (reasonable subset of a) Node.js-style `require(name)` function is
pretty simple. If `name` starts with a period, it is a path relative to the file
that called `require`. Just make the `require` used by each file keep track of
the current path and you’re done.

If `name` does not start with a period, it is a node module. Usually it is
located at `currentModuleRoot + "/node_modules/" + name + "/index.js"`. So make
`require` also keep track of the current module root. Simple.

However, there are two things that can complicate the above. The entry point of
a module might not necessarily be called “index.js”. The name can be defined by
the `main` property of the module’s package.json (if any). Moreover, the module
might be located in a parent module’s node\_modules directory, if they both
share a dependency.

This module precomputes the two complications above, to make a `require`
implementation simpler. You probably already had a build step; just add this
precomputation to it.

The idea is to first look for info in the precomputed data; if it’s not there
use the above steps.

Example output, from a hypothetical “x-lang” module:

```json
{
  "./node_modules/helpers": {
    "": "lib/main"
  },
  "./node_modules/parser": {
    "source-map": "."
  },
  "./node_modules/parser/node_modules/helpers": {
    "": "main"
  },
  "./node_modules/parser/node_modules/tokenizer": {
    "helpers": "./node_modules/parser"
  },
  "./node_modules/compiler/node_modules/stringifier": {
    "": "stringify",
    "source-map": ".",
    "token-names": "./node_modules/compiler"
  },
  "./node_modules/source-map": {
    "": "lib/source-map"
  }
}
```

In the above example, x-lang depends on “helpers”, “source-map”, “parser” and
“compiler” (and possibly other modules as well, but if so they didn’t need any
data in the output). The parser also depends on helpers, but it cannot use the
top-level helpers because it uses a different version. (Those two versions
happen to use different files as the main entry-point.) Both the parser and the
compiler’s stringifier depend on source-map, but unlike the helpers case they
reuse the top-level source-map.


Installation
============

`npm install require-precompute`

`var precompute = require("require-precompute")`


Usage
=====

`var data = precompute(dir)`
----------------------------

`dir` is the path to a directory to precompute.

`data` is a map between module root paths relative to `dir` and an object with
info about that module:

- The value of the key `""` (the empty string) is the path to the module’s
  entrypoint (if it has a package.json with the `main` property), relative to
  the module itself. The value has been `path.normalize`d, and the `.js` suffix
  (if any) has been removed.
- All other keys are module names that the module depends on (according to its
  package.json’s `dependencies` property (if any)), that aren’t in the module’s
  own node\_modules directory, but somewhere higher up. The values are the paths
  to those modules (relative to `dir`). The algorithm does not look outside
  `dir` for modules, and throws an error if it cannot be found there.


CLI
===

If you install this package globally, you’ll be able to run `require-precompute
[dir]`, which precomputes `dir` (defaults to the current directory) and prints
the result to stdout.


License
=======

[The X11 (“MIT”) License](LICENSE).
