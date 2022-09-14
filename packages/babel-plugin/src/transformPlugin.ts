import { types as t, template } from '@babel/core';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { ResolvedStyle } from '@kaze-style/core';

type State = {
  importDeclarationPaths?: NodePath<t.ImportDeclaration>[];
  calleePaths?: NodePath<t.Identifier>[];
  definitionPaths?: NodePath<t.ObjectExpression>[];
};

const options = {
  importSource: '@kaze-style/react',
  importName: '__preStyle',
  transformName: '__style',
};

const buildStyleImport = template(`
  import { ${options.transformName} } from '${options.importSource}';
`);

export type Options = {
  resolvedStyles: ResolvedStyle[];
};

export const transformPlugin = declare<Options, PluginObj<State & PluginPass>>(
  (_, { resolvedStyles }) => {
    return {
      name: '@kaze-style/babel-plugin-transform',
      pre() {
        this.importDeclarationPaths = [];
        this.calleePaths = [];
        this.definitionPaths = [];
      },
      visitor: {
        Program: {
          exit(path, state) {
            if (state.definitionPaths && state.definitionPaths.length !== 0) {
              state.definitionPaths.forEach((_definitionPath) => {
                const definitionPath =
                  _definitionPath as NodePath<t.Expression>;
                const callExpressionPath = definitionPath.findParent(
                  (parentPath) => parentPath.isCallExpression(),
                ) as NodePath<t.CallExpression>;
                const indexArgPath = callExpressionPath.node
                  .arguments[3] as t.NumericLiteral;
                const classes = resolvedStyles.find(
                  (resolvedStyle) => resolvedStyle.index === indexArgPath.value,
                )?.classes;
                callExpressionPath.node.arguments = [t.valueToNode(classes)];
              });
            }

            if (state.calleePaths && state.calleePaths.length !== 0) {
              path.unshiftContainer('body', buildStyleImport());
              state.calleePaths.forEach((calleePath) => {
                calleePath.replaceWith(t.identifier(options.transformName));
              });
            }
          },
        },
        ImportDeclaration(path, state) {
          if (path.node.source.value === options.importSource) {
            state.importDeclarationPaths?.push(path);
          }
        },
        CallExpression(path, state) {
          const calleePath = path.get('callee');
          if (
            state.importDeclarationPaths &&
            state.importDeclarationPaths.length !== 0 &&
            calleePath.referencesImport(
              options.importSource,
              options.importName,
            )
          ) {
            const argumentPaths = path.get('arguments') as NodePath<t.Node>[];
            if (Array.isArray(argumentPaths) && argumentPaths.length === 4) {
              const definitionsPath = argumentPaths[0];
              if (definitionsPath?.isObjectExpression()) {
                state.definitionPaths?.push(definitionsPath);
                state.calleePaths?.push(calleePath as NodePath<t.Identifier>);
              }
            }
          }
        },
      },
    };
  },
);
