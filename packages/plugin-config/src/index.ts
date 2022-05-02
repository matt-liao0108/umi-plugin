import { IApi } from 'umi';
import { join } from 'path';
import { readFileSync } from 'fs';
import { merge } from 'lodash';

export default function (api: IApi) {
  const { matt: config } = api.userConfig;
  // console.log(api.userConfig);
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
    const tmpPath = join(__dirname, '../runtime.tpl');
    const content = readFileSync(tmpPath, 'utf-8');
    api.writeTmpFile({
      path: 'plugin-matt-config/entry.tsx',
      content: api.utils.Mustache.render(content, {
        version,
        checkHTMLVersions: config.checkHTMLVersions && process.env.NODE_ENV === 'prodution',
      }),
    });
  }

  api.onGenerateFiles(async () => {
    await generatorInt();
  });

  // 运行时插件
  api.addRuntimePlugin(() => [join(api.paths.absTmpPath!, 'plugin-matt-config/entry')]);
  api.addRuntimePluginKey(() => 'entry');

  // 修改入口
  // api.modifyBundleConfig((bundleConfig) => {
  //   bundleConfig.entry.umi = join(api.paths.absTmpPath, 'entry.tsx');
  //   // bundleConfig.entry.umi
  //   return bundleConfig;
  // });

  //
}
