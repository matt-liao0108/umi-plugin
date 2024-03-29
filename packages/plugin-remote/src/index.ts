import { IApi } from 'umi';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { merge, chain } from 'lodash';
import { normalizeRemotes } from './helper';

export default function (api: IApi) {
  const { remote } = api.userConfig;
  api.describe({
    key: 'remote',
    config: {
      schema(joi) {
        return joi.object({
          name: joi.string().required(),
          filename: joi.string(),
          remotes: joi.object(),
          exposes: joi.object(),
          shared: joi.array().items(joi.alternatives().try(joi.string(), joi.object())),
        });
      },
    },
  });

  api.onGenerateFiles(async () => {
    const tmpPath = join(__dirname, '../exports.tsx.tpl');
    const content = readFileSync(tmpPath, 'utf-8');
    api.writeTmpFile({
      path: 'plugin-matt-remote/exports.tsx',
      content,
    });
    if (!existsSync(join(api.paths.absTmpPath, 'entry.ts'))) {
      api.writeTmpFile({
        path: 'entry.ts',
        content: `import("./umi.ts")`,
      });
    }
  });
  api.addUmiExports(() => ({
    source: '../plugin-matt-remote/exports',
    exportAll: true,
  }));

  const filename = 'remoteEntry.js';
  const defualtShared = [
    {
      react: {
        singleton: true,
        requiredVersion: '>=16.9.0',
        strictVersion: true,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '>=16.9.0',
        strictVersion: true,
      },
      'react-router-dom': {
        singleton: true,
        requiredVersion: '^5.0.0',
        strictVersion: true,
      },
      'react-router': {
        singleton: true,
        requiredVersion: '^5.0.0',
        strictVersion: true,
      },
    },
  ];
  api.chainWebpack((config) => {
    let { shared = [], remotes, ...resConfig } = remote || {};
    remotes = normalizeRemotes(remotes, filename);
    const remoteConfig = merge(
      {
        filename,
        shared: defualtShared.concat(shared),
        remotes,
      },
      resConfig
    );

    if (remoteConfig.exposes) {
      remoteConfig.exposes = chain(remoteConfig.exposes)
        .toPairs()
        .reduce(
          (p, [module, src]) => ({
            ...p,
            [module.startsWith('./') ? module : `./${module}`]: src,
          }),
          {}
        )
        .value();
    }
    config.plugin('federation').use(require('webpack/lib/container/ModuleFederationPlugin'), [remoteConfig]);
    config.output.publicPath('auto');
    return config;
  });
  api.modifyConfig((memo) => {
    return {
      dynamicImportSyntax: {},
      ...memo,
    };
  });
  api.modifyBundleConfig((bundleConfig) => {
    //@ts-ignore
    bundleConfig.entry.umi = join(api.paths.absTmpPath, 'entry.ts');
    return bundleConfig;
  });
}
