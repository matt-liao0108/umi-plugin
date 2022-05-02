import { lazy, useMemo } from 'react';
export const loadComponent = (scope: string, module: string) => {
  return async () => {
    // 初始化共享作用域（shared scope）用提供的已知此构建和所有远程的模块填充它
    // @ts-ignore
    await __webpack_init_sharing__('default');
    const container = window[scope]; // 或从其他地方获取容器
    // 初始化容器 它可能提供共享模块
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module.startsWith('./') ? module : `./${module}`);
    const Module = factory();
    return Module;
  };
};

export const RemoteComponent: React.FC<{
  scope: string;
  module: string;
  [k: string]: any;
}> = (props) => {
  const { scope, module, ...res } = props;
  const Component = useMemo(() => lazy(loadComponent(scope, module)), [scope, module]);
  return <Component {...res} />;
};
