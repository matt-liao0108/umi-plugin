import { IApi } from 'umi';
import { join } from 'path';
import { readFileSync } from 'fs';
import { merge } from 'lodash';

export default function (api: IApi) {
  const { matt: config, remote } = api.userConfig;
  api.describe({
    key: 'matt',
    config: {
      schema(joi) {
        return joi.object({
          checkHTMLVersions: joi.boolean(),
        });
      },
    },
  });
  const version = Date.now();
  api.modifyProdHTMLContent((content) => {
    return `<!-- version:${version} -->${content}`;
  });

  async function generatorInt() {
    const tmpPath = join(__dirname, './runtime.tpl');
    const content = readFileSync(tmpPath, 'utf-8');
    api.writeTmpFile({
      path: 'plugin-sino-config/entry.tsx',
      content: api.utils.Mustache.render(content, {
        version,
        checkHTMLVersions: config.checkHTMLVersions && process.env.NODE_ENV === 'prodution',
      }),
    });
  }

  api.onGenerateFiles(async () => {
    await generatorInt();
  });
  const filename = 'remoteEntry.js';

  // 运行时插件
  api.addRuntimePlugin(() => [join(api.paths.absTmpPath!, 'plugin-sino-config/entry')]);
  api.addRuntimePluginKey(() => 'entry');

  // 修改入口
  // api.modifyBundleConfig((bundleConfig) => {
  //   bundleConfig.entry.umi = join(api.paths.absTmpPath, 'entry.tsx');
  //   // bundleConfig.entry.umi
  //   return bundleConfig;
  // });

  //
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
  api.chainWebpack((config) => {
    const { shared, ...resConfig } = remote;
    const remoteConfig = merge(
      {
        filename,
        shared: defualtShared.concat(remote.shared),
      },
      resConfig
    );
    config.plugin('federation').use(require('webpack/lib/container/ModuleFederationPlugin'), [remoteConfig]);
    return config;
  });
}
