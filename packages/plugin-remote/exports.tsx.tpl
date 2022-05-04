import { lazy, useMemo, useState, useEffect, Suspense } from 'react';
import { Spin } from 'antd';
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

export const defaultFallback = (
  <Spin
    style={{
      padding: '6px',
    }}
    spinning={true}
    size="small"
  />
);
/**
 * @param props scope 应用名称 module 模块名称
 * @returns 远程组件
 */
export const RemoteComponent: React.FC<{
  scope: string;
  module: string;
  fallback?: any;
  [k: string]: any;
}> = (props) => {
  const { scope, module, fallback, ...res } = props;
  const Component = useMemo(() => lazy(loadComponent(scope, module)), [scope, module]);
  return (
    <Suspense fallback={fallback || defaultFallback}>
      <Component {...res} />;
    </Suspense>
  );
};

const urlCache = new Set();
/**
 *
 * @param url script url
 * @returns ready 是否准备好 errorLoading 加载失败
 */
export const useDynamicScript = (url: string): { ready: boolean; errorLoading: boolean } => {
  const [ready, setReady] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  useEffect(() => {
    if (!url) return;

    if (urlCache.has(url)) {
      setReady(true);
      setErrorLoading(false);
      return;
    }

    setReady(false);
    setErrorLoading(false);

    const element = document.createElement('script');
    element.src = url;
    element.type = 'text/javascript';
    element.async = true;
    element.onload = () => {
      urlCache.add(url);
      setReady(true);
    };
    element.onerror = () => {
      setReady(false);
      setErrorLoading(true);
    };

    document.head.appendChild(element);

    return () => {
      urlCache.delete(url);
      document.head.removeChild(element);
    };
  }, [url]);
  return {
    ready,
    errorLoading,
  };
};

//  const { Component: FederatedComponent, errorLoading } = useFederatedComponent(url, scope, module);
const components = new Map();
/**
 *
 * @param remoteUrl 远程模块地址
 * @param scope 应用名称
 * @param module 模块名称
 * @returns lazy Component 组件   errorLoading是否加载失败
 */
export const useFederationComponent = (
  remoteUrl: string,
  scope: string,
  module: string
): {
  Component: React.LazyExoticComponent<React.ComponentType<any>>;
  errorLoading: boolean;
} => {
  const key = `${remoteUrl}-${scope}-${module}`;
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    if (Component) setComponent(null);
  }, [key]);

  const { ready, errorLoading } = useDynamicScript(remoteUrl);
  useEffect(() => {
    if (ready && !Component) {
      const Com = lazy(loadComponent(scope, module));
      components.set(key, Com);
      setComponent(Com);
    }
  }, [ready, Component, key]);

  return {
    Component,
    errorLoading,
  };
};
