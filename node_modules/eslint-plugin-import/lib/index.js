'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const rules = exports.rules = {
  'no-unresolved': require('./rules/no-unresolved'),
  'named': require('./rules/named'),
  'default': require('./rules/default'),
  'namespace': require('./rules/namespace'),
  'no-namespace': require('./rules/no-namespace'),
  'export': require('./rules/export'),
  'no-mutable-exports': require('./rules/no-mutable-exports'),
  'extensions': require('./rules/extensions'),
  'no-restricted-paths': require('./rules/no-restricted-paths'),
  'no-internal-modules': require('./rules/no-internal-modules'),
  'group-exports': require('./rules/group-exports'),
  'no-relative-parent-imports': require('./rules/no-relative-parent-imports'),

  'no-self-import': require('./rules/no-self-import'),
  'no-cycle': require('./rules/no-cycle'),
  'no-named-default': require('./rules/no-named-default'),
  'no-named-as-default': require('./rules/no-named-as-default'),
  'no-named-as-default-member': require('./rules/no-named-as-default-member'),
  'no-anonymous-default-export': require('./rules/no-anonymous-default-export'),

  'no-commonjs': require('./rules/no-commonjs'),
  'no-amd': require('./rules/no-amd'),
  'no-duplicates': require('./rules/no-duplicates'),
  'first': require('./rules/first'),
  'max-dependencies': require('./rules/max-dependencies'),
  'no-extraneous-dependencies': require('./rules/no-extraneous-dependencies'),
  'no-absolute-path': require('./rules/no-absolute-path'),
  'no-nodejs-modules': require('./rules/no-nodejs-modules'),
  'no-webpack-loader-syntax': require('./rules/no-webpack-loader-syntax'),
  'order': require('./rules/order'),
  'newline-after-import': require('./rules/newline-after-import'),
  'prefer-default-export': require('./rules/prefer-default-export'),
  'no-default-export': require('./rules/no-default-export'),
  'no-named-export': require('./rules/no-named-export'),
  'no-dynamic-require': require('./rules/no-dynamic-require'),
  'unambiguous': require('./rules/unambiguous'),
  'no-unassigned-import': require('./rules/no-unassigned-import'),
  'no-useless-path-segments': require('./rules/no-useless-path-segments'),
  'dynamic-import-chunkname': require('./rules/dynamic-import-chunkname'),

  // export
  'exports-last': require('./rules/exports-last'),

  // metadata-based
  'no-deprecated': require('./rules/no-deprecated'),

  // deprecated aliases to rules
  'imports-first': require('./rules/imports-first')
};

const configs = exports.configs = {
  'recommended': require('../config/recommended'),

  'errors': require('../config/errors'),
  'warnings': require('../config/warnings'),

  // shhhh... work in progress "secret" rules
  'stage-0': require('../config/stage-0'),

  // useful stuff for folks using various environments
  'react': require('../config/react'),
  'react-native': require('../config/react-native'),
  'electron': require('../config/electron')
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInJ1bGVzIiwicmVxdWlyZSIsImNvbmZpZ3MiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQU8sTUFBTUEsd0JBQVE7QUFDbkIsbUJBQWlCQyxRQUFRLHVCQUFSLENBREU7QUFFbkIsV0FBU0EsUUFBUSxlQUFSLENBRlU7QUFHbkIsYUFBV0EsUUFBUSxpQkFBUixDQUhRO0FBSW5CLGVBQWFBLFFBQVEsbUJBQVIsQ0FKTTtBQUtuQixrQkFBZ0JBLFFBQVEsc0JBQVIsQ0FMRztBQU1uQixZQUFVQSxRQUFRLGdCQUFSLENBTlM7QUFPbkIsd0JBQXNCQSxRQUFRLDRCQUFSLENBUEg7QUFRbkIsZ0JBQWNBLFFBQVEsb0JBQVIsQ0FSSztBQVNuQix5QkFBdUJBLFFBQVEsNkJBQVIsQ0FUSjtBQVVuQix5QkFBdUJBLFFBQVEsNkJBQVIsQ0FWSjtBQVduQixtQkFBaUJBLFFBQVEsdUJBQVIsQ0FYRTtBQVluQixnQ0FBOEJBLFFBQVEsb0NBQVIsQ0FaWDs7QUFjbkIsb0JBQWtCQSxRQUFRLHdCQUFSLENBZEM7QUFlbkIsY0FBWUEsUUFBUSxrQkFBUixDQWZPO0FBZ0JuQixzQkFBb0JBLFFBQVEsMEJBQVIsQ0FoQkQ7QUFpQm5CLHlCQUF1QkEsUUFBUSw2QkFBUixDQWpCSjtBQWtCbkIsZ0NBQThCQSxRQUFRLG9DQUFSLENBbEJYO0FBbUJuQixpQ0FBK0JBLFFBQVEscUNBQVIsQ0FuQlo7O0FBcUJuQixpQkFBZUEsUUFBUSxxQkFBUixDQXJCSTtBQXNCbkIsWUFBVUEsUUFBUSxnQkFBUixDQXRCUztBQXVCbkIsbUJBQWlCQSxRQUFRLHVCQUFSLENBdkJFO0FBd0JuQixXQUFTQSxRQUFRLGVBQVIsQ0F4QlU7QUF5Qm5CLHNCQUFvQkEsUUFBUSwwQkFBUixDQXpCRDtBQTBCbkIsZ0NBQThCQSxRQUFRLG9DQUFSLENBMUJYO0FBMkJuQixzQkFBb0JBLFFBQVEsMEJBQVIsQ0EzQkQ7QUE0Qm5CLHVCQUFxQkEsUUFBUSwyQkFBUixDQTVCRjtBQTZCbkIsOEJBQTRCQSxRQUFRLGtDQUFSLENBN0JUO0FBOEJuQixXQUFTQSxRQUFRLGVBQVIsQ0E5QlU7QUErQm5CLDBCQUF3QkEsUUFBUSw4QkFBUixDQS9CTDtBQWdDbkIsMkJBQXlCQSxRQUFRLCtCQUFSLENBaENOO0FBaUNuQix1QkFBcUJBLFFBQVEsMkJBQVIsQ0FqQ0Y7QUFrQ25CLHFCQUFtQkEsUUFBUSx5QkFBUixDQWxDQTtBQW1DbkIsd0JBQXNCQSxRQUFRLDRCQUFSLENBbkNIO0FBb0NuQixpQkFBZUEsUUFBUSxxQkFBUixDQXBDSTtBQXFDbkIsMEJBQXdCQSxRQUFRLDhCQUFSLENBckNMO0FBc0NuQiw4QkFBNEJBLFFBQVEsa0NBQVIsQ0F0Q1Q7QUF1Q25CLDhCQUE0QkEsUUFBUSxrQ0FBUixDQXZDVDs7QUF5Q25CO0FBQ0Esa0JBQWdCQSxRQUFRLHNCQUFSLENBMUNHOztBQTRDbkI7QUFDQSxtQkFBaUJBLFFBQVEsdUJBQVIsQ0E3Q0U7O0FBK0NuQjtBQUNBLG1CQUFpQkEsUUFBUSx1QkFBUjtBQWhERSxDQUFkOztBQW1EQSxNQUFNQyw0QkFBVTtBQUNyQixpQkFBZUQsUUFBUSx1QkFBUixDQURNOztBQUdyQixZQUFVQSxRQUFRLGtCQUFSLENBSFc7QUFJckIsY0FBWUEsUUFBUSxvQkFBUixDQUpTOztBQU1yQjtBQUNBLGFBQVdBLFFBQVEsbUJBQVIsQ0FQVTs7QUFTckI7QUFDQSxXQUFTQSxRQUFRLGlCQUFSLENBVlk7QUFXckIsa0JBQWdCQSxRQUFRLHdCQUFSLENBWEs7QUFZckIsY0FBWUEsUUFBUSxvQkFBUjtBQVpTLENBQWhCIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IHJ1bGVzID0ge1xuICAnbm8tdW5yZXNvbHZlZCc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tdW5yZXNvbHZlZCcpLFxuICAnbmFtZWQnOiByZXF1aXJlKCcuL3J1bGVzL25hbWVkJyksXG4gICdkZWZhdWx0JzogcmVxdWlyZSgnLi9ydWxlcy9kZWZhdWx0JyksXG4gICduYW1lc3BhY2UnOiByZXF1aXJlKCcuL3J1bGVzL25hbWVzcGFjZScpLFxuICAnbm8tbmFtZXNwYWNlJzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lc3BhY2UnKSxcbiAgJ2V4cG9ydCc6IHJlcXVpcmUoJy4vcnVsZXMvZXhwb3J0JyksXG4gICduby1tdXRhYmxlLWV4cG9ydHMnOiByZXF1aXJlKCcuL3J1bGVzL25vLW11dGFibGUtZXhwb3J0cycpLFxuICAnZXh0ZW5zaW9ucyc6IHJlcXVpcmUoJy4vcnVsZXMvZXh0ZW5zaW9ucycpLFxuICAnbm8tcmVzdHJpY3RlZC1wYXRocyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tcmVzdHJpY3RlZC1wYXRocycpLFxuICAnbm8taW50ZXJuYWwtbW9kdWxlcyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8taW50ZXJuYWwtbW9kdWxlcycpLFxuICAnZ3JvdXAtZXhwb3J0cyc6IHJlcXVpcmUoJy4vcnVsZXMvZ3JvdXAtZXhwb3J0cycpLFxuICAnbm8tcmVsYXRpdmUtcGFyZW50LWltcG9ydHMnOiByZXF1aXJlKCcuL3J1bGVzL25vLXJlbGF0aXZlLXBhcmVudC1pbXBvcnRzJyksXG5cbiAgJ25vLXNlbGYtaW1wb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1zZWxmLWltcG9ydCcpLFxuICAnbm8tY3ljbGUnOiByZXF1aXJlKCcuL3J1bGVzL25vLWN5Y2xlJyksXG4gICduby1uYW1lZC1kZWZhdWx0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lZC1kZWZhdWx0JyksXG4gICduby1uYW1lZC1hcy1kZWZhdWx0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lZC1hcy1kZWZhdWx0JyksXG4gICduby1uYW1lZC1hcy1kZWZhdWx0LW1lbWJlcic6IHJlcXVpcmUoJy4vcnVsZXMvbm8tbmFtZWQtYXMtZGVmYXVsdC1tZW1iZXInKSxcbiAgJ25vLWFub255bW91cy1kZWZhdWx0LWV4cG9ydCc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tYW5vbnltb3VzLWRlZmF1bHQtZXhwb3J0JyksXG5cbiAgJ25vLWNvbW1vbmpzJzogcmVxdWlyZSgnLi9ydWxlcy9uby1jb21tb25qcycpLFxuICAnbm8tYW1kJzogcmVxdWlyZSgnLi9ydWxlcy9uby1hbWQnKSxcbiAgJ25vLWR1cGxpY2F0ZXMnOiByZXF1aXJlKCcuL3J1bGVzL25vLWR1cGxpY2F0ZXMnKSxcbiAgJ2ZpcnN0JzogcmVxdWlyZSgnLi9ydWxlcy9maXJzdCcpLFxuICAnbWF4LWRlcGVuZGVuY2llcyc6IHJlcXVpcmUoJy4vcnVsZXMvbWF4LWRlcGVuZGVuY2llcycpLFxuICAnbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMnOiByZXF1aXJlKCcuL3J1bGVzL25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzJyksXG4gICduby1hYnNvbHV0ZS1wYXRoJzogcmVxdWlyZSgnLi9ydWxlcy9uby1hYnNvbHV0ZS1wYXRoJyksXG4gICduby1ub2RlanMtbW9kdWxlcyc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tbm9kZWpzLW1vZHVsZXMnKSxcbiAgJ25vLXdlYnBhY2stbG9hZGVyLXN5bnRheCc6IHJlcXVpcmUoJy4vcnVsZXMvbm8td2VicGFjay1sb2FkZXItc3ludGF4JyksXG4gICdvcmRlcic6IHJlcXVpcmUoJy4vcnVsZXMvb3JkZXInKSxcbiAgJ25ld2xpbmUtYWZ0ZXItaW1wb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uZXdsaW5lLWFmdGVyLWltcG9ydCcpLFxuICAncHJlZmVyLWRlZmF1bHQtZXhwb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9wcmVmZXItZGVmYXVsdC1leHBvcnQnKSxcbiAgJ25vLWRlZmF1bHQtZXhwb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1kZWZhdWx0LWV4cG9ydCcpLFxuICAnbm8tbmFtZWQtZXhwb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uby1uYW1lZC1leHBvcnQnKSxcbiAgJ25vLWR5bmFtaWMtcmVxdWlyZSc6IHJlcXVpcmUoJy4vcnVsZXMvbm8tZHluYW1pYy1yZXF1aXJlJyksXG4gICd1bmFtYmlndW91cyc6IHJlcXVpcmUoJy4vcnVsZXMvdW5hbWJpZ3VvdXMnKSxcbiAgJ25vLXVuYXNzaWduZWQtaW1wb3J0JzogcmVxdWlyZSgnLi9ydWxlcy9uby11bmFzc2lnbmVkLWltcG9ydCcpLFxuICAnbm8tdXNlbGVzcy1wYXRoLXNlZ21lbnRzJzogcmVxdWlyZSgnLi9ydWxlcy9uby11c2VsZXNzLXBhdGgtc2VnbWVudHMnKSxcbiAgJ2R5bmFtaWMtaW1wb3J0LWNodW5rbmFtZSc6IHJlcXVpcmUoJy4vcnVsZXMvZHluYW1pYy1pbXBvcnQtY2h1bmtuYW1lJyksXG5cbiAgLy8gZXhwb3J0XG4gICdleHBvcnRzLWxhc3QnOiByZXF1aXJlKCcuL3J1bGVzL2V4cG9ydHMtbGFzdCcpLFxuXG4gIC8vIG1ldGFkYXRhLWJhc2VkXG4gICduby1kZXByZWNhdGVkJzogcmVxdWlyZSgnLi9ydWxlcy9uby1kZXByZWNhdGVkJyksXG5cbiAgLy8gZGVwcmVjYXRlZCBhbGlhc2VzIHRvIHJ1bGVzXG4gICdpbXBvcnRzLWZpcnN0JzogcmVxdWlyZSgnLi9ydWxlcy9pbXBvcnRzLWZpcnN0JyksXG59XG5cbmV4cG9ydCBjb25zdCBjb25maWdzID0ge1xuICAncmVjb21tZW5kZWQnOiByZXF1aXJlKCcuLi9jb25maWcvcmVjb21tZW5kZWQnKSxcblxuICAnZXJyb3JzJzogcmVxdWlyZSgnLi4vY29uZmlnL2Vycm9ycycpLFxuICAnd2FybmluZ3MnOiByZXF1aXJlKCcuLi9jb25maWcvd2FybmluZ3MnKSxcblxuICAvLyBzaGhoaC4uLiB3b3JrIGluIHByb2dyZXNzIFwic2VjcmV0XCIgcnVsZXNcbiAgJ3N0YWdlLTAnOiByZXF1aXJlKCcuLi9jb25maWcvc3RhZ2UtMCcpLFxuXG4gIC8vIHVzZWZ1bCBzdHVmZiBmb3IgZm9sa3MgdXNpbmcgdmFyaW91cyBlbnZpcm9ubWVudHNcbiAgJ3JlYWN0JzogcmVxdWlyZSgnLi4vY29uZmlnL3JlYWN0JyksXG4gICdyZWFjdC1uYXRpdmUnOiByZXF1aXJlKCcuLi9jb25maWcvcmVhY3QtbmF0aXZlJyksXG4gICdlbGVjdHJvbic6IHJlcXVpcmUoJy4uL2NvbmZpZy9lbGVjdHJvbicpLFxufVxuIl19