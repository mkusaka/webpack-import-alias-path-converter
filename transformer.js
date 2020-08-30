const j = require("jscodeshift");
const { resolve, dirname, delimiter } = require("path");
const { invert } = require("lodash-es");

const alias = {
  subdir: resolve(__dirname, "example/subdirb"),
  src: resolve(__dirname, "example"),
};

const invertedAlias = invert(alias);
const aliasedKeys = Object.keys(alias);

/**
 * @type {import("jscodeshift").Transform}
 */
module.exports = function (fileInfo, api) {
  return api
    .jscodeshift(fileInfo.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      /** @type {any} */
      const importName = path.node.source.value;
      if (aliasedKeys.some((key) => importName.match(new RegExp(`^${key}`)))) {
        return;
      }
      const sourceDirectoryPath = resolve(dirname(fileInfo.path));
      const dir = resolve(sourceDirectoryPath, importName);
      let aliasedPath = importName;
      for (const alias of Object.entries(invertedAlias)) {
        const [path, aliased] = alias;
        if (dir.match(new RegExp(`^${path}`))) {
          aliasedPath = dir.replace(new RegExp(`^${path}`), aliased);
          break;
        }
      }
      path.node.source.value = aliasedPath;
    })
    .toSource();
};
