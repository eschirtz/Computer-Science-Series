'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recursivePatternCapture = recursivePatternCapture;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _doctrine = require('doctrine');

var _doctrine2 = _interopRequireDefault(_doctrine);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _sourceCode = require('eslint/lib/util/source-code');

var _sourceCode2 = _interopRequireDefault(_sourceCode);

var _parse = require('eslint-module-utils/parse');

var _parse2 = _interopRequireDefault(_parse);

var _resolve = require('eslint-module-utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _ignore = require('eslint-module-utils/ignore');

var _ignore2 = _interopRequireDefault(_ignore);

var _hash = require('eslint-module-utils/hash');

var _unambiguous = require('eslint-module-utils/unambiguous');

var unambiguous = _interopRequireWildcard(_unambiguous);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _debug2.default)('eslint-plugin-import:ExportMap');

const exportCache = new Map();

class ExportMap {
  constructor(path) {
    this.path = path;
    this.namespace = new Map();
    // todo: restructure to key on path, value is resolver + map of names
    this.reexports = new Map();
    /**
     * star-exports
     * @type {Set} of () => ExportMap
     */
    this.dependencies = new Set();
    /**
     * dependencies of this module that are not explicitly re-exported
     * @type {Map} from path = () => ExportMap
     */
    this.imports = new Map();
    this.errors = [];
  }

  get hasDefault() {
    return this.get('default') != null;
  } // stronger than this.has

  get size() {
    let size = this.namespace.size + this.reexports.size;
    this.dependencies.forEach(dep => {
      const d = dep();
      // CJS / ignored dependencies won't exist (#717)
      if (d == null) return;
      size += d.size;
    });
    return size;
  }

  /**
   * Note that this does not check explicitly re-exported names for existence
   * in the base namespace, but it will expand all `export * from '...'` exports
   * if not found in the explicit namespace.
   * @param  {string}  name
   * @return {Boolean} true if `name` is exported by this module.
   */
  has(name) {
    if (this.namespace.has(name)) return true;
    if (this.reexports.has(name)) return true;

    // default exports must be explicitly re-exported (#328)
    if (name !== 'default') {
      for (let dep of this.dependencies) {
        let innerMap = dep();

        // todo: report as unresolved?
        if (!innerMap) continue;

        if (innerMap.has(name)) return true;
      }
    }

    return false;
  }

  /**
   * ensure that imported name fully resolves.
   * @param  {[type]}  name [description]
   * @return {Boolean}      [description]
   */
  hasDeep(name) {
    if (this.namespace.has(name)) return { found: true, path: [this] };

    if (this.reexports.has(name)) {
      const reexports = this.reexports.get(name),
            imported = reexports.getImport();

      // if import is ignored, return explicit 'null'
      if (imported == null) return { found: true, path: [this]

        // safeguard against cycles, only if name matches
      };if (imported.path === this.path && reexports.local === name) {
        return { found: false, path: [this] };
      }

      const deep = imported.hasDeep(reexports.local);
      deep.path.unshift(this);

      return deep;
    }

    // default exports must be explicitly re-exported (#328)
    if (name !== 'default') {
      for (let dep of this.dependencies) {
        let innerMap = dep();
        // todo: report as unresolved?
        if (!innerMap) continue;

        // safeguard against cycles
        if (innerMap.path === this.path) continue;

        let innerValue = innerMap.hasDeep(name);
        if (innerValue.found) {
          innerValue.path.unshift(this);
          return innerValue;
        }
      }
    }

    return { found: false, path: [this] };
  }

  get(name) {
    if (this.namespace.has(name)) return this.namespace.get(name);

    if (this.reexports.has(name)) {
      const reexports = this.reexports.get(name),
            imported = reexports.getImport();

      // if import is ignored, return explicit 'null'
      if (imported == null) return null;

      // safeguard against cycles, only if name matches
      if (imported.path === this.path && reexports.local === name) return undefined;

      return imported.get(reexports.local);
    }

    // default exports must be explicitly re-exported (#328)
    if (name !== 'default') {
      for (let dep of this.dependencies) {
        let innerMap = dep();
        // todo: report as unresolved?
        if (!innerMap) continue;

        // safeguard against cycles
        if (innerMap.path === this.path) continue;

        let innerValue = innerMap.get(name);
        if (innerValue !== undefined) return innerValue;
      }
    }

    return undefined;
  }

  forEach(callback, thisArg) {
    this.namespace.forEach((v, n) => callback.call(thisArg, v, n, this));

    this.reexports.forEach((reexports, name) => {
      const reexported = reexports.getImport();
      // can't look up meta for ignored re-exports (#348)
      callback.call(thisArg, reexported && reexported.get(reexports.local), name, this);
    });

    this.dependencies.forEach(dep => {
      const d = dep();
      // CJS / ignored dependencies won't exist (#717)
      if (d == null) return;

      d.forEach((v, n) => n !== 'default' && callback.call(thisArg, v, n, this));
    });
  }

  // todo: keys, values, entries?

  reportErrors(context, declaration) {
    context.report({
      node: declaration.source,
      message: `Parse errors in imported module '${declaration.source.value}': ` + `${this.errors.map(e => `${e.message} (${e.lineNumber}:${e.column})`).join(', ')}`
    });
  }
}

exports.default = ExportMap; /**
                              * parse docs from the first node that has leading comments
                              * @param  {...[type]} nodes [description]
                              * @return {{doc: object}}
                              */

function captureDoc(source, docStyleParsers) {
  const metadata = {},
        nodes = Array.prototype.slice.call(arguments, 1);

  // 'some' short-circuits on first 'true'
  nodes.some(n => {
    try {
      // n.leadingComments is legacy `attachComments` behavior
      let leadingComments = n.leadingComments || source.getCommentsBefore(n);
      if (leadingComments.length === 0) return false;

      for (let name in docStyleParsers) {
        const doc = docStyleParsers[name](leadingComments);
        if (doc) {
          metadata.doc = doc;
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  });

  return metadata;
}

const availableDocStyleParsers = {
  jsdoc: captureJsDoc,
  tomdoc: captureTomDoc

  /**
   * parse JSDoc from leading comments
   * @param  {...[type]} comments [description]
   * @return {{doc: object}}
   */
};function captureJsDoc(comments) {
  let doc;

  // capture XSDoc
  comments.forEach(comment => {
    // skip non-block comments
    if (comment.value.slice(0, 4) !== '*\n *') return;
    try {
      doc = _doctrine2.default.parse(comment.value, { unwrap: true });
    } catch (err) {
      /* don't care, for now? maybe add to `errors?` */
    }
  });

  return doc;
}

/**
  * parse TomDoc section from comments
  */
function captureTomDoc(comments) {
  // collect lines up to first paragraph break
  const lines = [];
  for (let i = 0; i < comments.length; i++) {
    const comment = comments[i];
    if (comment.value.match(/^\s*$/)) break;
    lines.push(comment.value.trim());
  }

  // return doctrine-like object
  const statusMatch = lines.join(' ').match(/^(Public|Internal|Deprecated):\s*(.+)/);
  if (statusMatch) {
    return {
      description: statusMatch[2],
      tags: [{
        title: statusMatch[1].toLowerCase(),
        description: statusMatch[2]
      }]
    };
  }
}

ExportMap.get = function (source, context) {
  const path = (0, _resolve2.default)(source, context);
  if (path == null) return null;

  return ExportMap.for(childContext(path, context));
};

ExportMap.for = function (context) {
  const path = context.path;


  const cacheKey = (0, _hash.hashObject)(context).digest('hex');
  let exportMap = exportCache.get(cacheKey);

  // return cached ignore
  if (exportMap === null) return null;

  const stats = _fs2.default.statSync(path);
  if (exportMap != null) {
    // date equality check
    if (exportMap.mtime - stats.mtime === 0) {
      return exportMap;
    }
    // future: check content equality?
  }

  // check valid extensions first
  if (!(0, _ignore.hasValidExtension)(path, context)) {
    exportCache.set(cacheKey, null);
    return null;
  }

  const content = _fs2.default.readFileSync(path, { encoding: 'utf8' });

  // check for and cache ignore
  if ((0, _ignore2.default)(path, context) || !unambiguous.test(content)) {
    log('ignored path due to unambiguous regex or ignore settings:', path);
    exportCache.set(cacheKey, null);
    return null;
  }

  log('cache miss', cacheKey, 'for path', path);
  exportMap = ExportMap.parse(path, content, context);

  // ambiguous modules return null
  if (exportMap == null) return null;

  exportMap.mtime = stats.mtime;

  exportCache.set(cacheKey, exportMap);
  return exportMap;
};

ExportMap.parse = function (path, content, context) {
  var m = new ExportMap(path);

  try {
    var ast = (0, _parse2.default)(path, content, context);
  } catch (err) {
    log('parse error:', path, err);
    m.errors.push(err);
    return m; // can't continue
  }

  if (!unambiguous.isModule(ast)) return null;

  const docstyle = context.settings && context.settings['import/docstyle'] || ['jsdoc'];
  const docStyleParsers = {};
  docstyle.forEach(style => {
    docStyleParsers[style] = availableDocStyleParsers[style];
  });

  const source = makeSourceCode(content, ast);

  // attempt to collect module doc
  if (ast.comments) {
    ast.comments.some(c => {
      if (c.type !== 'Block') return false;
      try {
        const doc = _doctrine2.default.parse(c.value, { unwrap: true });
        if (doc.tags.some(t => t.title === 'module')) {
          m.doc = doc;
          return true;
        }
      } catch (err) {/* ignore */}
      return false;
    });
  }

  const namespaces = new Map();

  function remotePath(value) {
    return _resolve2.default.relative(value, path, context.settings);
  }

  function resolveImport(value) {
    const rp = remotePath(value);
    if (rp == null) return null;
    return ExportMap.for(childContext(rp, context));
  }

  function getNamespace(identifier) {
    if (!namespaces.has(identifier.name)) return;

    return function () {
      return resolveImport(namespaces.get(identifier.name));
    };
  }

  function addNamespace(object, identifier) {
    const nsfn = getNamespace(identifier);
    if (nsfn) {
      Object.defineProperty(object, 'namespace', { get: nsfn });
    }

    return object;
  }

  function captureDependency(declaration) {
    if (declaration.source == null) return null;

    const p = remotePath(declaration.source.value);
    if (p == null) return null;
    const existing = m.imports.get(p);
    if (existing != null) return existing.getter;

    const getter = () => ExportMap.for(childContext(p, context));
    m.imports.set(p, {
      getter,
      source: { // capturing actual node reference holds full AST in memory!
        value: declaration.source.value,
        loc: declaration.source.loc
      }
    });
    return getter;
  }

  ast.body.forEach(function (n) {

    if (n.type === 'ExportDefaultDeclaration') {
      const exportMeta = captureDoc(source, docStyleParsers, n);
      if (n.declaration.type === 'Identifier') {
        addNamespace(exportMeta, n.declaration);
      }
      m.namespace.set('default', exportMeta);
      return;
    }

    if (n.type === 'ExportAllDeclaration') {
      const getter = captureDependency(n);
      if (getter) m.dependencies.add(getter);
      return;
    }

    // capture namespaces in case of later export
    if (n.type === 'ImportDeclaration') {
      captureDependency(n);
      let ns;
      if (n.specifiers.some(s => s.type === 'ImportNamespaceSpecifier' && (ns = s))) {
        namespaces.set(ns.local.name, n.source.value);
      }
      return;
    }

    if (n.type === 'ExportNamedDeclaration') {
      // capture declaration
      if (n.declaration != null) {
        switch (n.declaration.type) {
          case 'FunctionDeclaration':
          case 'ClassDeclaration':
          case 'TypeAlias': // flowtype with babel-eslint parser
          case 'InterfaceDeclaration':
          case 'TSEnumDeclaration':
          case 'TSInterfaceDeclaration':
          case 'TSAbstractClassDeclaration':
          case 'TSModuleDeclaration':
            m.namespace.set(n.declaration.id.name, captureDoc(source, docStyleParsers, n));
            break;
          case 'VariableDeclaration':
            n.declaration.declarations.forEach(d => recursivePatternCapture(d.id, id => m.namespace.set(id.name, captureDoc(source, docStyleParsers, d, n))));
            break;
        }
      }

      const nsource = n.source && n.source.value;
      n.specifiers.forEach(s => {
        const exportMeta = {};
        let local;

        switch (s.type) {
          case 'ExportDefaultSpecifier':
            if (!n.source) return;
            local = 'default';
            break;
          case 'ExportNamespaceSpecifier':
            m.namespace.set(s.exported.name, Object.defineProperty(exportMeta, 'namespace', {
              get() {
                return resolveImport(nsource);
              }
            }));
            return;
          case 'ExportSpecifier':
            if (!n.source) {
              m.namespace.set(s.exported.name, addNamespace(exportMeta, s.local));
              return;
            }
          // else falls through
          default:
            local = s.local.name;
            break;
        }

        // todo: JSDoc
        m.reexports.set(s.exported.name, { local, getImport: () => resolveImport(nsource) });
      });
    }
  });

  return m;
};

/**
 * Traverse a pattern/identifier node, calling 'callback'
 * for each leaf identifier.
 * @param  {node}   pattern
 * @param  {Function} callback
 * @return {void}
 */
function recursivePatternCapture(pattern, callback) {
  switch (pattern.type) {
    case 'Identifier':
      // base case
      callback(pattern);
      break;

    case 'ObjectPattern':
      pattern.properties.forEach(p => {
        recursivePatternCapture(p.value, callback);
      });
      break;

    case 'ArrayPattern':
      pattern.elements.forEach(element => {
        if (element == null) return;
        recursivePatternCapture(element, callback);
      });
      break;

    case 'AssignmentPattern':
      callback(pattern.left);
      break;
  }
}

/**
 * don't hold full context object in memory, just grab what we need.
 */
function childContext(path, context) {
  const settings = context.settings,
        parserOptions = context.parserOptions,
        parserPath = context.parserPath;

  return {
    settings,
    parserOptions,
    parserPath,
    path
  };
}

/**
 * sometimes legacy support isn't _that_ hard... right?
 */
function makeSourceCode(text, ast) {
  if (_sourceCode2.default.length > 1) {
    // ESLint 3
    return new _sourceCode2.default(text, ast);
  } else {
    // ESLint 4, 5
    return new _sourceCode2.default({ text, ast });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkV4cG9ydE1hcC5qcyJdLCJuYW1lcyI6WyJyZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZSIsInVuYW1iaWd1b3VzIiwibG9nIiwiZXhwb3J0Q2FjaGUiLCJNYXAiLCJFeHBvcnRNYXAiLCJjb25zdHJ1Y3RvciIsInBhdGgiLCJuYW1lc3BhY2UiLCJyZWV4cG9ydHMiLCJkZXBlbmRlbmNpZXMiLCJTZXQiLCJpbXBvcnRzIiwiZXJyb3JzIiwiaGFzRGVmYXVsdCIsImdldCIsInNpemUiLCJmb3JFYWNoIiwiZGVwIiwiZCIsImhhcyIsIm5hbWUiLCJpbm5lck1hcCIsImhhc0RlZXAiLCJmb3VuZCIsImltcG9ydGVkIiwiZ2V0SW1wb3J0IiwibG9jYWwiLCJkZWVwIiwidW5zaGlmdCIsImlubmVyVmFsdWUiLCJ1bmRlZmluZWQiLCJjYWxsYmFjayIsInRoaXNBcmciLCJ2IiwibiIsImNhbGwiLCJyZWV4cG9ydGVkIiwicmVwb3J0RXJyb3JzIiwiY29udGV4dCIsImRlY2xhcmF0aW9uIiwicmVwb3J0Iiwibm9kZSIsInNvdXJjZSIsIm1lc3NhZ2UiLCJ2YWx1ZSIsIm1hcCIsImUiLCJsaW5lTnVtYmVyIiwiY29sdW1uIiwiam9pbiIsImNhcHR1cmVEb2MiLCJkb2NTdHlsZVBhcnNlcnMiLCJtZXRhZGF0YSIsIm5vZGVzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImFyZ3VtZW50cyIsInNvbWUiLCJsZWFkaW5nQ29tbWVudHMiLCJnZXRDb21tZW50c0JlZm9yZSIsImxlbmd0aCIsImRvYyIsImVyciIsImF2YWlsYWJsZURvY1N0eWxlUGFyc2VycyIsImpzZG9jIiwiY2FwdHVyZUpzRG9jIiwidG9tZG9jIiwiY2FwdHVyZVRvbURvYyIsImNvbW1lbnRzIiwiY29tbWVudCIsImRvY3RyaW5lIiwicGFyc2UiLCJ1bndyYXAiLCJsaW5lcyIsImkiLCJtYXRjaCIsInB1c2giLCJ0cmltIiwic3RhdHVzTWF0Y2giLCJkZXNjcmlwdGlvbiIsInRhZ3MiLCJ0aXRsZSIsInRvTG93ZXJDYXNlIiwiZm9yIiwiY2hpbGRDb250ZXh0IiwiY2FjaGVLZXkiLCJkaWdlc3QiLCJleHBvcnRNYXAiLCJzdGF0cyIsImZzIiwic3RhdFN5bmMiLCJtdGltZSIsInNldCIsImNvbnRlbnQiLCJyZWFkRmlsZVN5bmMiLCJlbmNvZGluZyIsInRlc3QiLCJtIiwiYXN0IiwiaXNNb2R1bGUiLCJkb2NzdHlsZSIsInNldHRpbmdzIiwic3R5bGUiLCJtYWtlU291cmNlQ29kZSIsImMiLCJ0eXBlIiwidCIsIm5hbWVzcGFjZXMiLCJyZW1vdGVQYXRoIiwicmVzb2x2ZSIsInJlbGF0aXZlIiwicmVzb2x2ZUltcG9ydCIsInJwIiwiZ2V0TmFtZXNwYWNlIiwiaWRlbnRpZmllciIsImFkZE5hbWVzcGFjZSIsIm9iamVjdCIsIm5zZm4iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImNhcHR1cmVEZXBlbmRlbmN5IiwicCIsImV4aXN0aW5nIiwiZ2V0dGVyIiwibG9jIiwiYm9keSIsImV4cG9ydE1ldGEiLCJhZGQiLCJucyIsInNwZWNpZmllcnMiLCJzIiwiaWQiLCJkZWNsYXJhdGlvbnMiLCJuc291cmNlIiwiZXhwb3J0ZWQiLCJwYXR0ZXJuIiwicHJvcGVydGllcyIsImVsZW1lbnRzIiwiZWxlbWVudCIsImxlZnQiLCJwYXJzZXJPcHRpb25zIiwicGFyc2VyUGF0aCIsInRleHQiLCJTb3VyY2VDb2RlIl0sIm1hcHBpbmdzIjoiOzs7OztRQTBmZ0JBLHVCLEdBQUFBLHVCOztBQTFmaEI7Ozs7QUFFQTs7OztBQUVBOzs7O0FBRUE7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7SUFBWUMsVzs7Ozs7O0FBRVosTUFBTUMsTUFBTSxxQkFBTSxnQ0FBTixDQUFaOztBQUVBLE1BQU1DLGNBQWMsSUFBSUMsR0FBSixFQUFwQjs7QUFFZSxNQUFNQyxTQUFOLENBQWdCO0FBQzdCQyxjQUFZQyxJQUFaLEVBQWtCO0FBQ2hCLFNBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLFNB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QUF0QixFQUE0QmdDLE9BQTVCLEVBQXFDO0FBQUEsUUFDM0JnRSxRQUQyQixHQUNhaEUsT0FEYixDQUMzQmdFLFFBRDJCO0FBQUEsUUFDakJ1QyxhQURpQixHQUNhdkcsT0FEYixDQUNqQnVHLGFBRGlCO0FBQUEsUUFDRkMsVUFERSxHQUNheEcsT0FEYixDQUNGd0csVUFERTs7QUFFbkMsU0FBTztBQUNMeEMsWUFESztBQUVMdUMsaUJBRks7QUFHTEMsY0FISztBQUlMeEk7QUFKSyxHQUFQO0FBTUQ7O0FBR0Q7OztBQUdBLFNBQVNrRyxjQUFULENBQXdCdUMsSUFBeEIsRUFBOEI1QyxHQUE5QixFQUFtQztBQUNqQyxNQUFJNkMscUJBQVduRixNQUFYLEdBQW9CLENBQXhCLEVBQTJCO0FBQ3pCO0FBQ0EsV0FBTyxJQUFJbUYsb0JBQUosQ0FBZUQsSUFBZixFQUFxQjVDLEdBQXJCLENBQVA7QUFDRCxHQUhELE1BR087QUFDTDtBQUNBLFdBQU8sSUFBSTZDLG9CQUFKLENBQWUsRUFBRUQsSUFBRixFQUFRNUMsR0FBUixFQUFmLENBQVA7QUFDRDtBQUNGIiwiZmlsZSI6IkV4cG9ydE1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tICdmcydcblxuaW1wb3J0IGRvY3RyaW5lIGZyb20gJ2RvY3RyaW5lJ1xuXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnXG5cbmltcG9ydCBTb3VyY2VDb2RlIGZyb20gJ2VzbGludC9saWIvdXRpbC9zb3VyY2UtY29kZSdcblxuaW1wb3J0IHBhcnNlIGZyb20gJ2VzbGludC1tb2R1bGUtdXRpbHMvcGFyc2UnXG5pbXBvcnQgcmVzb2x2ZSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3Jlc29sdmUnXG5pbXBvcnQgaXNJZ25vcmVkLCB7IGhhc1ZhbGlkRXh0ZW5zaW9uIH0gZnJvbSAnZXNsaW50LW1vZHVsZS11dGlscy9pZ25vcmUnXG5cbmltcG9ydCB7IGhhc2hPYmplY3QgfSBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL2hhc2gnXG5pbXBvcnQgKiBhcyB1bmFtYmlndW91cyBmcm9tICdlc2xpbnQtbW9kdWxlLXV0aWxzL3VuYW1iaWd1b3VzJ1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnZXNsaW50LXBsdWdpbi1pbXBvcnQ6RXhwb3J0TWFwJylcblxuY29uc3QgZXhwb3J0Q2FjaGUgPSBuZXcgTWFwKClcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwb3J0TWFwIHtcbiAgY29uc3RydWN0b3IocGF0aCkge1xuICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG5ldyBNYXAoKVxuICAgIC8vIHRvZG86IHJlc3RydWN0dXJlIHRvIGtleSBvbiBwYXRoLCB2YWx1ZSBpcyByZXNvbHZlciArIG1hcCBvZiBuYW1lc1xuICAgIHRoaXMucmVleHBvcnRzID0gbmV3IE1hcCgpXG4gICAgLyoqXG4gICAgICogc3Rhci1leHBvcnRzXG4gICAgICogQHR5cGUge1NldH0gb2YgKCkgPT4gRXhwb3J0TWFwXG4gICAgICovXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMgPSBuZXcgU2V0KClcbiAgICAvKipcbiAgICAgKiBkZXBlbmRlbmNpZXMgb2YgdGhpcyBtb2R1bGUgdGhhdCBhcmUgbm90IGV4cGxpY2l0bHkgcmUtZXhwb3J0ZWRcbiAgICAgKiBAdHlwZSB7TWFwfSBmcm9tIHBhdGggPSAoKSA9PiBFeHBvcnRNYXBcbiAgICAgKi9cbiAgICB0aGlzLmltcG9ydHMgPSBuZXcgTWFwKClcbiAgICB0aGlzLmVycm9ycyA9IFtdXG4gIH1cblxuICBnZXQgaGFzRGVmYXVsdCgpIHsgcmV0dXJuIHRoaXMuZ2V0KCdkZWZhdWx0JykgIT0gbnVsbCB9IC8vIHN0cm9uZ2VyIHRoYW4gdGhpcy5oYXNcblxuICBnZXQgc2l6ZSgpIHtcbiAgICBsZXQgc2l6ZSA9IHRoaXMubmFtZXNwYWNlLnNpemUgKyB0aGlzLnJlZXhwb3J0cy5zaXplXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xuICAgICAgY29uc3QgZCA9IGRlcCgpXG4gICAgICAvLyBDSlMgLyBpZ25vcmVkIGRlcGVuZGVuY2llcyB3b24ndCBleGlzdCAoIzcxNylcbiAgICAgIGlmIChkID09IG51bGwpIHJldHVyblxuICAgICAgc2l6ZSArPSBkLnNpemVcbiAgICB9KVxuICAgIHJldHVybiBzaXplXG4gIH1cblxuICAvKipcbiAgICogTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgY2hlY2sgZXhwbGljaXRseSByZS1leHBvcnRlZCBuYW1lcyBmb3IgZXhpc3RlbmNlXG4gICAqIGluIHRoZSBiYXNlIG5hbWVzcGFjZSwgYnV0IGl0IHdpbGwgZXhwYW5kIGFsbCBgZXhwb3J0ICogZnJvbSAnLi4uJ2AgZXhwb3J0c1xuICAgKiBpZiBub3QgZm91bmQgaW4gdGhlIGV4cGxpY2l0IG5hbWVzcGFjZS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSAgbmFtZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIGBuYW1lYCBpcyBleHBvcnRlZCBieSB0aGlzIG1vZHVsZS5cbiAgICovXG4gIGhhcyhuYW1lKSB7XG4gICAgaWYgKHRoaXMubmFtZXNwYWNlLmhhcyhuYW1lKSkgcmV0dXJuIHRydWVcbiAgICBpZiAodGhpcy5yZWV4cG9ydHMuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZVxuXG4gICAgLy8gZGVmYXVsdCBleHBvcnRzIG11c3QgYmUgZXhwbGljaXRseSByZS1leHBvcnRlZCAoIzMyOClcbiAgICBpZiAobmFtZSAhPT0gJ2RlZmF1bHQnKSB7XG4gICAgICBmb3IgKGxldCBkZXAgb2YgdGhpcy5kZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgbGV0IGlubmVyTWFwID0gZGVwKClcblxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cbiAgICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWVcblxuICAgICAgICBpZiAoaW5uZXJNYXAuaGFzKG5hbWUpKSByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIGVuc3VyZSB0aGF0IGltcG9ydGVkIG5hbWUgZnVsbHkgcmVzb2x2ZXMuXG4gICAqIEBwYXJhbSAge1t0eXBlXX0gIG5hbWUgW2Rlc2NyaXB0aW9uXVxuICAgKiBAcmV0dXJuIHtCb29sZWFufSAgICAgIFtkZXNjcmlwdGlvbl1cbiAgICovXG4gIGhhc0RlZXAobmFtZSkge1xuICAgIGlmICh0aGlzLm5hbWVzcGFjZS5oYXMobmFtZSkpIHJldHVybiB7IGZvdW5kOiB0cnVlLCBwYXRoOiBbdGhpc10gfVxuXG4gICAgaWYgKHRoaXMucmVleHBvcnRzLmhhcyhuYW1lKSkge1xuICAgICAgY29uc3QgcmVleHBvcnRzID0gdGhpcy5yZWV4cG9ydHMuZ2V0KG5hbWUpXG4gICAgICAgICAgLCBpbXBvcnRlZCA9IHJlZXhwb3J0cy5nZXRJbXBvcnQoKVxuXG4gICAgICAvLyBpZiBpbXBvcnQgaXMgaWdub3JlZCwgcmV0dXJuIGV4cGxpY2l0ICdudWxsJ1xuICAgICAgaWYgKGltcG9ydGVkID09IG51bGwpIHJldHVybiB7IGZvdW5kOiB0cnVlLCBwYXRoOiBbdGhpc10gfVxuXG4gICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXMsIG9ubHkgaWYgbmFtZSBtYXRjaGVzXG4gICAgICBpZiAoaW1wb3J0ZWQucGF0aCA9PT0gdGhpcy5wYXRoICYmIHJlZXhwb3J0cy5sb2NhbCA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4geyBmb3VuZDogZmFsc2UsIHBhdGg6IFt0aGlzXSB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlZXAgPSBpbXBvcnRlZC5oYXNEZWVwKHJlZXhwb3J0cy5sb2NhbClcbiAgICAgIGRlZXAucGF0aC51bnNoaWZ0KHRoaXMpXG5cbiAgICAgIHJldHVybiBkZWVwXG4gICAgfVxuXG5cbiAgICAvLyBkZWZhdWx0IGV4cG9ydHMgbXVzdCBiZSBleHBsaWNpdGx5IHJlLWV4cG9ydGVkICgjMzI4KVxuICAgIGlmIChuYW1lICE9PSAnZGVmYXVsdCcpIHtcbiAgICAgIGZvciAobGV0IGRlcCBvZiB0aGlzLmRlcGVuZGVuY2llcykge1xuICAgICAgICBsZXQgaW5uZXJNYXAgPSBkZXAoKVxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cbiAgICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWVcblxuICAgICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXNcbiAgICAgICAgaWYgKGlubmVyTWFwLnBhdGggPT09IHRoaXMucGF0aCkgY29udGludWVcblxuICAgICAgICBsZXQgaW5uZXJWYWx1ZSA9IGlubmVyTWFwLmhhc0RlZXAobmFtZSlcbiAgICAgICAgaWYgKGlubmVyVmFsdWUuZm91bmQpIHtcbiAgICAgICAgICBpbm5lclZhbHVlLnBhdGgudW5zaGlmdCh0aGlzKVxuICAgICAgICAgIHJldHVybiBpbm5lclZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4geyBmb3VuZDogZmFsc2UsIHBhdGg6IFt0aGlzXSB9XG4gIH1cblxuICBnZXQobmFtZSkge1xuICAgIGlmICh0aGlzLm5hbWVzcGFjZS5oYXMobmFtZSkpIHJldHVybiB0aGlzLm5hbWVzcGFjZS5nZXQobmFtZSlcblxuICAgIGlmICh0aGlzLnJlZXhwb3J0cy5oYXMobmFtZSkpIHtcbiAgICAgIGNvbnN0IHJlZXhwb3J0cyA9IHRoaXMucmVleHBvcnRzLmdldChuYW1lKVxuICAgICAgICAgICwgaW1wb3J0ZWQgPSByZWV4cG9ydHMuZ2V0SW1wb3J0KClcblxuICAgICAgLy8gaWYgaW1wb3J0IGlzIGlnbm9yZWQsIHJldHVybiBleHBsaWNpdCAnbnVsbCdcbiAgICAgIGlmIChpbXBvcnRlZCA9PSBudWxsKSByZXR1cm4gbnVsbFxuXG4gICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXMsIG9ubHkgaWYgbmFtZSBtYXRjaGVzXG4gICAgICBpZiAoaW1wb3J0ZWQucGF0aCA9PT0gdGhpcy5wYXRoICYmIHJlZXhwb3J0cy5sb2NhbCA9PT0gbmFtZSkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgICByZXR1cm4gaW1wb3J0ZWQuZ2V0KHJlZXhwb3J0cy5sb2NhbClcbiAgICB9XG5cbiAgICAvLyBkZWZhdWx0IGV4cG9ydHMgbXVzdCBiZSBleHBsaWNpdGx5IHJlLWV4cG9ydGVkICgjMzI4KVxuICAgIGlmIChuYW1lICE9PSAnZGVmYXVsdCcpIHtcbiAgICAgIGZvciAobGV0IGRlcCBvZiB0aGlzLmRlcGVuZGVuY2llcykge1xuICAgICAgICBsZXQgaW5uZXJNYXAgPSBkZXAoKVxuICAgICAgICAvLyB0b2RvOiByZXBvcnQgYXMgdW5yZXNvbHZlZD9cbiAgICAgICAgaWYgKCFpbm5lck1hcCkgY29udGludWVcblxuICAgICAgICAvLyBzYWZlZ3VhcmQgYWdhaW5zdCBjeWNsZXNcbiAgICAgICAgaWYgKGlubmVyTWFwLnBhdGggPT09IHRoaXMucGF0aCkgY29udGludWVcblxuICAgICAgICBsZXQgaW5uZXJWYWx1ZSA9IGlubmVyTWFwLmdldChuYW1lKVxuICAgICAgICBpZiAoaW5uZXJWYWx1ZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gaW5uZXJWYWx1ZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICB0aGlzLm5hbWVzcGFjZS5mb3JFYWNoKCh2LCBuKSA9PlxuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2LCBuLCB0aGlzKSlcblxuICAgIHRoaXMucmVleHBvcnRzLmZvckVhY2goKHJlZXhwb3J0cywgbmFtZSkgPT4ge1xuICAgICAgY29uc3QgcmVleHBvcnRlZCA9IHJlZXhwb3J0cy5nZXRJbXBvcnQoKVxuICAgICAgLy8gY2FuJ3QgbG9vayB1cCBtZXRhIGZvciBpZ25vcmVkIHJlLWV4cG9ydHMgKCMzNDgpXG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHJlZXhwb3J0ZWQgJiYgcmVleHBvcnRlZC5nZXQocmVleHBvcnRzLmxvY2FsKSwgbmFtZSwgdGhpcylcbiAgICB9KVxuXG4gICAgdGhpcy5kZXBlbmRlbmNpZXMuZm9yRWFjaChkZXAgPT4ge1xuICAgICAgY29uc3QgZCA9IGRlcCgpXG4gICAgICAvLyBDSlMgLyBpZ25vcmVkIGRlcGVuZGVuY2llcyB3b24ndCBleGlzdCAoIzcxNylcbiAgICAgIGlmIChkID09IG51bGwpIHJldHVyblxuXG4gICAgICBkLmZvckVhY2goKHYsIG4pID0+XG4gICAgICAgIG4gIT09ICdkZWZhdWx0JyAmJiBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHYsIG4sIHRoaXMpKVxuICAgIH0pXG4gIH1cblxuICAvLyB0b2RvOiBrZXlzLCB2YWx1ZXMsIGVudHJpZXM/XG5cbiAgcmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKSB7XG4gICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgbm9kZTogZGVjbGFyYXRpb24uc291cmNlLFxuICAgICAgbWVzc2FnZTogYFBhcnNlIGVycm9ycyBpbiBpbXBvcnRlZCBtb2R1bGUgJyR7ZGVjbGFyYXRpb24uc291cmNlLnZhbHVlfSc6IGAgK1xuICAgICAgICAgICAgICAgICAgYCR7dGhpcy5lcnJvcnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZSA9PiBgJHtlLm1lc3NhZ2V9ICgke2UubGluZU51bWJlcn06JHtlLmNvbHVtbn0pYClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpfWAsXG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIHBhcnNlIGRvY3MgZnJvbSB0aGUgZmlyc3Qgbm9kZSB0aGF0IGhhcyBsZWFkaW5nIGNvbW1lbnRzXG4gKiBAcGFyYW0gIHsuLi5bdHlwZV19IG5vZGVzIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge3tkb2M6IG9iamVjdH19XG4gKi9cbmZ1bmN0aW9uIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMpIHtcbiAgY29uc3QgbWV0YWRhdGEgPSB7fVxuICAgICAgICwgbm9kZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG5cbiAgLy8gJ3NvbWUnIHNob3J0LWNpcmN1aXRzIG9uIGZpcnN0ICd0cnVlJ1xuICBub2Rlcy5zb21lKG4gPT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBuLmxlYWRpbmdDb21tZW50cyBpcyBsZWdhY3kgYGF0dGFjaENvbW1lbnRzYCBiZWhhdmlvclxuICAgICAgbGV0IGxlYWRpbmdDb21tZW50cyA9IG4ubGVhZGluZ0NvbW1lbnRzIHx8IHNvdXJjZS5nZXRDb21tZW50c0JlZm9yZShuKVxuICAgICAgaWYgKGxlYWRpbmdDb21tZW50cy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZVxuXG4gICAgICBmb3IgKGxldCBuYW1lIGluIGRvY1N0eWxlUGFyc2Vycykge1xuICAgICAgICBjb25zdCBkb2MgPSBkb2NTdHlsZVBhcnNlcnNbbmFtZV0obGVhZGluZ0NvbW1lbnRzKVxuICAgICAgICBpZiAoZG9jKSB7XG4gICAgICAgICAgbWV0YWRhdGEuZG9jID0gZG9jXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gbWV0YWRhdGFcbn1cblxuY29uc3QgYXZhaWxhYmxlRG9jU3R5bGVQYXJzZXJzID0ge1xuICBqc2RvYzogY2FwdHVyZUpzRG9jLFxuICB0b21kb2M6IGNhcHR1cmVUb21Eb2MsXG59XG5cbi8qKlxuICogcGFyc2UgSlNEb2MgZnJvbSBsZWFkaW5nIGNvbW1lbnRzXG4gKiBAcGFyYW0gIHsuLi5bdHlwZV19IGNvbW1lbnRzIFtkZXNjcmlwdGlvbl1cbiAqIEByZXR1cm4ge3tkb2M6IG9iamVjdH19XG4gKi9cbmZ1bmN0aW9uIGNhcHR1cmVKc0RvYyhjb21tZW50cykge1xuICBsZXQgZG9jXG5cbiAgLy8gY2FwdHVyZSBYU0RvY1xuICBjb21tZW50cy5mb3JFYWNoKGNvbW1lbnQgPT4ge1xuICAgIC8vIHNraXAgbm9uLWJsb2NrIGNvbW1lbnRzXG4gICAgaWYgKGNvbW1lbnQudmFsdWUuc2xpY2UoMCwgNCkgIT09ICcqXFxuIConKSByZXR1cm5cbiAgICB0cnkge1xuICAgICAgZG9jID0gZG9jdHJpbmUucGFyc2UoY29tbWVudC52YWx1ZSwgeyB1bndyYXA6IHRydWUgfSlcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8qIGRvbid0IGNhcmUsIGZvciBub3c/IG1heWJlIGFkZCB0byBgZXJyb3JzP2AgKi9cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGRvY1xufVxuXG4vKipcbiAgKiBwYXJzZSBUb21Eb2Mgc2VjdGlvbiBmcm9tIGNvbW1lbnRzXG4gICovXG5mdW5jdGlvbiBjYXB0dXJlVG9tRG9jKGNvbW1lbnRzKSB7XG4gIC8vIGNvbGxlY3QgbGluZXMgdXAgdG8gZmlyc3QgcGFyYWdyYXBoIGJyZWFrXG4gIGNvbnN0IGxpbmVzID0gW11cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGNvbW1lbnQgPSBjb21tZW50c1tpXVxuICAgIGlmIChjb21tZW50LnZhbHVlLm1hdGNoKC9eXFxzKiQvKSkgYnJlYWtcbiAgICBsaW5lcy5wdXNoKGNvbW1lbnQudmFsdWUudHJpbSgpKVxuICB9XG5cbiAgLy8gcmV0dXJuIGRvY3RyaW5lLWxpa2Ugb2JqZWN0XG4gIGNvbnN0IHN0YXR1c01hdGNoID0gbGluZXMuam9pbignICcpLm1hdGNoKC9eKFB1YmxpY3xJbnRlcm5hbHxEZXByZWNhdGVkKTpcXHMqKC4rKS8pXG4gIGlmIChzdGF0dXNNYXRjaCkge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNjcmlwdGlvbjogc3RhdHVzTWF0Y2hbMl0sXG4gICAgICB0YWdzOiBbe1xuICAgICAgICB0aXRsZTogc3RhdHVzTWF0Y2hbMV0udG9Mb3dlckNhc2UoKSxcbiAgICAgICAgZGVzY3JpcHRpb246IHN0YXR1c01hdGNoWzJdLFxuICAgICAgfV0sXG4gICAgfVxuICB9XG59XG5cbkV4cG9ydE1hcC5nZXQgPSBmdW5jdGlvbiAoc291cmNlLCBjb250ZXh0KSB7XG4gIGNvbnN0IHBhdGggPSByZXNvbHZlKHNvdXJjZSwgY29udGV4dClcbiAgaWYgKHBhdGggPT0gbnVsbCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gRXhwb3J0TWFwLmZvcihjaGlsZENvbnRleHQocGF0aCwgY29udGV4dCkpXG59XG5cbkV4cG9ydE1hcC5mb3IgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBjb25zdCB7IHBhdGggfSA9IGNvbnRleHRcblxuICBjb25zdCBjYWNoZUtleSA9IGhhc2hPYmplY3QoY29udGV4dCkuZGlnZXN0KCdoZXgnKVxuICBsZXQgZXhwb3J0TWFwID0gZXhwb3J0Q2FjaGUuZ2V0KGNhY2hlS2V5KVxuXG4gIC8vIHJldHVybiBjYWNoZWQgaWdub3JlXG4gIGlmIChleHBvcnRNYXAgPT09IG51bGwpIHJldHVybiBudWxsXG5cbiAgY29uc3Qgc3RhdHMgPSBmcy5zdGF0U3luYyhwYXRoKVxuICBpZiAoZXhwb3J0TWFwICE9IG51bGwpIHtcbiAgICAvLyBkYXRlIGVxdWFsaXR5IGNoZWNrXG4gICAgaWYgKGV4cG9ydE1hcC5tdGltZSAtIHN0YXRzLm10aW1lID09PSAwKSB7XG4gICAgICByZXR1cm4gZXhwb3J0TWFwXG4gICAgfVxuICAgIC8vIGZ1dHVyZTogY2hlY2sgY29udGVudCBlcXVhbGl0eT9cbiAgfVxuXG4gIC8vIGNoZWNrIHZhbGlkIGV4dGVuc2lvbnMgZmlyc3RcbiAgaWYgKCFoYXNWYWxpZEV4dGVuc2lvbihwYXRoLCBjb250ZXh0KSkge1xuICAgIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgbnVsbClcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhwYXRoLCB7IGVuY29kaW5nOiAndXRmOCcgfSlcblxuICAvLyBjaGVjayBmb3IgYW5kIGNhY2hlIGlnbm9yZVxuICBpZiAoaXNJZ25vcmVkKHBhdGgsIGNvbnRleHQpIHx8ICF1bmFtYmlndW91cy50ZXN0KGNvbnRlbnQpKSB7XG4gICAgbG9nKCdpZ25vcmVkIHBhdGggZHVlIHRvIHVuYW1iaWd1b3VzIHJlZ2V4IG9yIGlnbm9yZSBzZXR0aW5nczonLCBwYXRoKVxuICAgIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgbnVsbClcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgbG9nKCdjYWNoZSBtaXNzJywgY2FjaGVLZXksICdmb3IgcGF0aCcsIHBhdGgpXG4gIGV4cG9ydE1hcCA9IEV4cG9ydE1hcC5wYXJzZShwYXRoLCBjb250ZW50LCBjb250ZXh0KVxuXG4gIC8vIGFtYmlndW91cyBtb2R1bGVzIHJldHVybiBudWxsXG4gIGlmIChleHBvcnRNYXAgPT0gbnVsbCkgcmV0dXJuIG51bGxcblxuICBleHBvcnRNYXAubXRpbWUgPSBzdGF0cy5tdGltZVxuXG4gIGV4cG9ydENhY2hlLnNldChjYWNoZUtleSwgZXhwb3J0TWFwKVxuICByZXR1cm4gZXhwb3J0TWFwXG59XG5cblxuRXhwb3J0TWFwLnBhcnNlID0gZnVuY3Rpb24gKHBhdGgsIGNvbnRlbnQsIGNvbnRleHQpIHtcbiAgdmFyIG0gPSBuZXcgRXhwb3J0TWFwKHBhdGgpXG5cbiAgdHJ5IHtcbiAgICB2YXIgYXN0ID0gcGFyc2UocGF0aCwgY29udGVudCwgY29udGV4dClcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nKCdwYXJzZSBlcnJvcjonLCBwYXRoLCBlcnIpXG4gICAgbS5lcnJvcnMucHVzaChlcnIpXG4gICAgcmV0dXJuIG0gLy8gY2FuJ3QgY29udGludWVcbiAgfVxuXG4gIGlmICghdW5hbWJpZ3VvdXMuaXNNb2R1bGUoYXN0KSkgcmV0dXJuIG51bGxcblxuICBjb25zdCBkb2NzdHlsZSA9IChjb250ZXh0LnNldHRpbmdzICYmIGNvbnRleHQuc2V0dGluZ3NbJ2ltcG9ydC9kb2NzdHlsZSddKSB8fCBbJ2pzZG9jJ11cbiAgY29uc3QgZG9jU3R5bGVQYXJzZXJzID0ge31cbiAgZG9jc3R5bGUuZm9yRWFjaChzdHlsZSA9PiB7XG4gICAgZG9jU3R5bGVQYXJzZXJzW3N0eWxlXSA9IGF2YWlsYWJsZURvY1N0eWxlUGFyc2Vyc1tzdHlsZV1cbiAgfSlcblxuICBjb25zdCBzb3VyY2UgPSBtYWtlU291cmNlQ29kZShjb250ZW50LCBhc3QpXG5cbiAgLy8gYXR0ZW1wdCB0byBjb2xsZWN0IG1vZHVsZSBkb2NcbiAgaWYgKGFzdC5jb21tZW50cykge1xuICAgIGFzdC5jb21tZW50cy5zb21lKGMgPT4ge1xuICAgICAgaWYgKGMudHlwZSAhPT0gJ0Jsb2NrJykgcmV0dXJuIGZhbHNlXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBkb2MgPSBkb2N0cmluZS5wYXJzZShjLnZhbHVlLCB7IHVud3JhcDogdHJ1ZSB9KVxuICAgICAgICBpZiAoZG9jLnRhZ3Muc29tZSh0ID0+IHQudGl0bGUgPT09ICdtb2R1bGUnKSkge1xuICAgICAgICAgIG0uZG9jID0gZG9jXG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7IC8qIGlnbm9yZSAqLyB9XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgbmFtZXNwYWNlcyA9IG5ldyBNYXAoKVxuXG4gIGZ1bmN0aW9uIHJlbW90ZVBhdGgodmFsdWUpIHtcbiAgICByZXR1cm4gcmVzb2x2ZS5yZWxhdGl2ZSh2YWx1ZSwgcGF0aCwgY29udGV4dC5zZXR0aW5ncylcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmVJbXBvcnQodmFsdWUpIHtcbiAgICBjb25zdCBycCA9IHJlbW90ZVBhdGgodmFsdWUpXG4gICAgaWYgKHJwID09IG51bGwpIHJldHVybiBudWxsXG4gICAgcmV0dXJuIEV4cG9ydE1hcC5mb3IoY2hpbGRDb250ZXh0KHJwLCBjb250ZXh0KSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5hbWVzcGFjZShpZGVudGlmaWVyKSB7XG4gICAgaWYgKCFuYW1lc3BhY2VzLmhhcyhpZGVudGlmaWVyLm5hbWUpKSByZXR1cm5cblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZUltcG9ydChuYW1lc3BhY2VzLmdldChpZGVudGlmaWVyLm5hbWUpKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZE5hbWVzcGFjZShvYmplY3QsIGlkZW50aWZpZXIpIHtcbiAgICBjb25zdCBuc2ZuID0gZ2V0TmFtZXNwYWNlKGlkZW50aWZpZXIpXG4gICAgaWYgKG5zZm4pIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsICduYW1lc3BhY2UnLCB7IGdldDogbnNmbiB9KVxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhcHR1cmVEZXBlbmRlbmN5KGRlY2xhcmF0aW9uKSB7XG4gICAgaWYgKGRlY2xhcmF0aW9uLnNvdXJjZSA9PSBudWxsKSByZXR1cm4gbnVsbFxuXG4gICAgY29uc3QgcCA9IHJlbW90ZVBhdGgoZGVjbGFyYXRpb24uc291cmNlLnZhbHVlKVxuICAgIGlmIChwID09IG51bGwpIHJldHVybiBudWxsXG4gICAgY29uc3QgZXhpc3RpbmcgPSBtLmltcG9ydHMuZ2V0KHApXG4gICAgaWYgKGV4aXN0aW5nICE9IG51bGwpIHJldHVybiBleGlzdGluZy5nZXR0ZXJcblxuICAgIGNvbnN0IGdldHRlciA9ICgpID0+IEV4cG9ydE1hcC5mb3IoY2hpbGRDb250ZXh0KHAsIGNvbnRleHQpKVxuICAgIG0uaW1wb3J0cy5zZXQocCwge1xuICAgICAgZ2V0dGVyLFxuICAgICAgc291cmNlOiB7ICAvLyBjYXB0dXJpbmcgYWN0dWFsIG5vZGUgcmVmZXJlbmNlIGhvbGRzIGZ1bGwgQVNUIGluIG1lbW9yeSFcbiAgICAgICAgdmFsdWU6IGRlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZSxcbiAgICAgICAgbG9jOiBkZWNsYXJhdGlvbi5zb3VyY2UubG9jLFxuICAgICAgfSxcbiAgICB9KVxuICAgIHJldHVybiBnZXR0ZXJcbiAgfVxuXG5cbiAgYXN0LmJvZHkuZm9yRWFjaChmdW5jdGlvbiAobikge1xuXG4gICAgaWYgKG4udHlwZSA9PT0gJ0V4cG9ydERlZmF1bHREZWNsYXJhdGlvbicpIHtcbiAgICAgIGNvbnN0IGV4cG9ydE1ldGEgPSBjYXB0dXJlRG9jKHNvdXJjZSwgZG9jU3R5bGVQYXJzZXJzLCBuKVxuICAgICAgaWYgKG4uZGVjbGFyYXRpb24udHlwZSA9PT0gJ0lkZW50aWZpZXInKSB7XG4gICAgICAgIGFkZE5hbWVzcGFjZShleHBvcnRNZXRhLCBuLmRlY2xhcmF0aW9uKVxuICAgICAgfVxuICAgICAgbS5uYW1lc3BhY2Uuc2V0KCdkZWZhdWx0JywgZXhwb3J0TWV0YSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChuLnR5cGUgPT09ICdFeHBvcnRBbGxEZWNsYXJhdGlvbicpIHtcbiAgICAgIGNvbnN0IGdldHRlciA9IGNhcHR1cmVEZXBlbmRlbmN5KG4pXG4gICAgICBpZiAoZ2V0dGVyKSBtLmRlcGVuZGVuY2llcy5hZGQoZ2V0dGVyKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gY2FwdHVyZSBuYW1lc3BhY2VzIGluIGNhc2Ugb2YgbGF0ZXIgZXhwb3J0XG4gICAgaWYgKG4udHlwZSA9PT0gJ0ltcG9ydERlY2xhcmF0aW9uJykge1xuICAgICAgY2FwdHVyZURlcGVuZGVuY3kobilcbiAgICAgIGxldCBuc1xuICAgICAgaWYgKG4uc3BlY2lmaWVycy5zb21lKHMgPT4gcy50eXBlID09PSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJyAmJiAobnMgPSBzKSkpIHtcbiAgICAgICAgbmFtZXNwYWNlcy5zZXQobnMubG9jYWwubmFtZSwgbi5zb3VyY2UudmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAobi50eXBlID09PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicpIHtcbiAgICAgIC8vIGNhcHR1cmUgZGVjbGFyYXRpb25cbiAgICAgIGlmIChuLmRlY2xhcmF0aW9uICE9IG51bGwpIHtcbiAgICAgICAgc3dpdGNoIChuLmRlY2xhcmF0aW9uLnR5cGUpIHtcbiAgICAgICAgICBjYXNlICdGdW5jdGlvbkRlY2xhcmF0aW9uJzpcbiAgICAgICAgICBjYXNlICdDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgICAgICBjYXNlICdUeXBlQWxpYXMnOiAvLyBmbG93dHlwZSB3aXRoIGJhYmVsLWVzbGludCBwYXJzZXJcbiAgICAgICAgICBjYXNlICdJbnRlcmZhY2VEZWNsYXJhdGlvbic6XG4gICAgICAgICAgY2FzZSAnVFNFbnVtRGVjbGFyYXRpb24nOlxuICAgICAgICAgIGNhc2UgJ1RTSW50ZXJmYWNlRGVjbGFyYXRpb24nOlxuICAgICAgICAgIGNhc2UgJ1RTQWJzdHJhY3RDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgICAgICBjYXNlICdUU01vZHVsZURlY2xhcmF0aW9uJzpcbiAgICAgICAgICAgIG0ubmFtZXNwYWNlLnNldChuLmRlY2xhcmF0aW9uLmlkLm5hbWUsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIG4pKVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICBjYXNlICdWYXJpYWJsZURlY2xhcmF0aW9uJzpcbiAgICAgICAgICAgIG4uZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goKGQpID0+XG4gICAgICAgICAgICAgIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKGQuaWQsXG4gICAgICAgICAgICAgICAgaWQgPT4gbS5uYW1lc3BhY2Uuc2V0KGlkLm5hbWUsIGNhcHR1cmVEb2Moc291cmNlLCBkb2NTdHlsZVBhcnNlcnMsIGQsIG4pKSkpXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5zb3VyY2UgPSBuLnNvdXJjZSAmJiBuLnNvdXJjZS52YWx1ZVxuICAgICAgbi5zcGVjaWZpZXJzLmZvckVhY2goKHMpID0+IHtcbiAgICAgICAgY29uc3QgZXhwb3J0TWV0YSA9IHt9XG4gICAgICAgIGxldCBsb2NhbFxuXG4gICAgICAgIHN3aXRjaCAocy50eXBlKSB7XG4gICAgICAgICAgY2FzZSAnRXhwb3J0RGVmYXVsdFNwZWNpZmllcic6XG4gICAgICAgICAgICBpZiAoIW4uc291cmNlKSByZXR1cm5cbiAgICAgICAgICAgIGxvY2FsID0gJ2RlZmF1bHQnXG4gICAgICAgICAgICBicmVha1xuICAgICAgICAgIGNhc2UgJ0V4cG9ydE5hbWVzcGFjZVNwZWNpZmllcic6XG4gICAgICAgICAgICBtLm5hbWVzcGFjZS5zZXQocy5leHBvcnRlZC5uYW1lLCBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0TWV0YSwgJ25hbWVzcGFjZScsIHtcbiAgICAgICAgICAgICAgZ2V0KCkgeyByZXR1cm4gcmVzb2x2ZUltcG9ydChuc291cmNlKSB9LFxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICBjYXNlICdFeHBvcnRTcGVjaWZpZXInOlxuICAgICAgICAgICAgaWYgKCFuLnNvdXJjZSkge1xuICAgICAgICAgICAgICBtLm5hbWVzcGFjZS5zZXQocy5leHBvcnRlZC5uYW1lLCBhZGROYW1lc3BhY2UoZXhwb3J0TWV0YSwgcy5sb2NhbCkpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSBmYWxscyB0aHJvdWdoXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxvY2FsID0gcy5sb2NhbC5uYW1lXG4gICAgICAgICAgICBicmVha1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdG9kbzogSlNEb2NcbiAgICAgICAgbS5yZWV4cG9ydHMuc2V0KHMuZXhwb3J0ZWQubmFtZSwgeyBsb2NhbCwgZ2V0SW1wb3J0OiAoKSA9PiByZXNvbHZlSW1wb3J0KG5zb3VyY2UpIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gbVxufVxuXG5cbi8qKlxuICogVHJhdmVyc2UgYSBwYXR0ZXJuL2lkZW50aWZpZXIgbm9kZSwgY2FsbGluZyAnY2FsbGJhY2snXG4gKiBmb3IgZWFjaCBsZWFmIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0gIHtub2RlfSAgIHBhdHRlcm5cbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlY3Vyc2l2ZVBhdHRlcm5DYXB0dXJlKHBhdHRlcm4sIGNhbGxiYWNrKSB7XG4gIHN3aXRjaCAocGF0dGVybi50eXBlKSB7XG4gICAgY2FzZSAnSWRlbnRpZmllcic6IC8vIGJhc2UgY2FzZVxuICAgICAgY2FsbGJhY2socGF0dGVybilcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdPYmplY3RQYXR0ZXJuJzpcbiAgICAgIHBhdHRlcm4ucHJvcGVydGllcy5mb3JFYWNoKHAgPT4ge1xuICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShwLnZhbHVlLCBjYWxsYmFjaylcbiAgICAgIH0pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnQXJyYXlQYXR0ZXJuJzpcbiAgICAgIHBhdHRlcm4uZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAoZWxlbWVudCA9PSBudWxsKSByZXR1cm5cbiAgICAgICAgcmVjdXJzaXZlUGF0dGVybkNhcHR1cmUoZWxlbWVudCwgY2FsbGJhY2spXG4gICAgICB9KVxuICAgICAgYnJlYWtcblxuICAgIGNhc2UgJ0Fzc2lnbm1lbnRQYXR0ZXJuJzpcbiAgICAgIGNhbGxiYWNrKHBhdHRlcm4ubGVmdClcbiAgICAgIGJyZWFrXG4gIH1cbn1cblxuLyoqXG4gKiBkb24ndCBob2xkIGZ1bGwgY29udGV4dCBvYmplY3QgaW4gbWVtb3J5LCBqdXN0IGdyYWIgd2hhdCB3ZSBuZWVkLlxuICovXG5mdW5jdGlvbiBjaGlsZENvbnRleHQocGF0aCwgY29udGV4dCkge1xuICBjb25zdCB7IHNldHRpbmdzLCBwYXJzZXJPcHRpb25zLCBwYXJzZXJQYXRoIH0gPSBjb250ZXh0XG4gIHJldHVybiB7XG4gICAgc2V0dGluZ3MsXG4gICAgcGFyc2VyT3B0aW9ucyxcbiAgICBwYXJzZXJQYXRoLFxuICAgIHBhdGgsXG4gIH1cbn1cblxuXG4vKipcbiAqIHNvbWV0aW1lcyBsZWdhY3kgc3VwcG9ydCBpc24ndCBfdGhhdF8gaGFyZC4uLiByaWdodD9cbiAqL1xuZnVuY3Rpb24gbWFrZVNvdXJjZUNvZGUodGV4dCwgYXN0KSB7XG4gIGlmIChTb3VyY2VDb2RlLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBFU0xpbnQgM1xuICAgIHJldHVybiBuZXcgU291cmNlQ29kZSh0ZXh0LCBhc3QpXG4gIH0gZWxzZSB7XG4gICAgLy8gRVNMaW50IDQsIDVcbiAgICByZXR1cm4gbmV3IFNvdXJjZUNvZGUoeyB0ZXh0LCBhc3QgfSlcbiAgfVxufVxuIl19