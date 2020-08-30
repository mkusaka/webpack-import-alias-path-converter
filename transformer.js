const j = require("jscodeshift");
const { resolve, dirname } = require("path");

const pathAlias = {
  subdir: resolve(__dirname, "example/subdirb"),
  src: resolve(__dirname, "example"),
};

const aliasedKeys = Object.keys(pathAlias);

const options = {
  // allowd relative hell depth.
  allowDepth: 1,
};

/** @param {number} depth */
const relativePathRegExp = (depth) => {
  if (depth === 1) {
    return "\\.\\/";
  }
  return Array(depth).fill("\\.\\.\\/").join("");
};

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
      if (
        aliasedKeys.some((key) => importName.match(new RegExp(`^${key}/`))) ||
        (options.allowDepth > 0 &&
          importName.match(
            new RegExp(`^${relativePathRegExp(options.allowDepth)}`)
          ))
      ) {
        return;
      }
      const sourceDirectoryPath = resolve(dirname(fileInfo.path));
      const dir = resolve(sourceDirectoryPath, importName);
      let aliasedPath = importName;
      for (const alias of Object.entries(pathAlias)) {
        const [aliased, path] = alias;
        if (dir.match(new RegExp(`^${path}`))) {
          aliasedPath = dir.replace(new RegExp(`^${path}`), aliased);
          break;
        }
      }
      path.node.source.value = aliasedPath;
    })
    .toSource();
};
