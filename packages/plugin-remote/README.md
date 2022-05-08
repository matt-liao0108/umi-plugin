# umi 配置 webpack5 moduleFederation 插件

## .umirc

```typescript
{
	plugins:['@matt-umi/plugin-remote'],
	remote:{
		name:'moduleName',  // module 应用名称
		filename:'remoteEntry.js',  //  默认暴露的文件名
		exposes:{ // 暴露的模块
			expose:'./src/expose'  // 模块名称
		},
		remotes:{  // 远程应用
			remote: 'http://localhost:8000'  // 默认会处理成 module@url/filename
		},
		shared:['react'] // 共享依赖 默认react react-router
	}
}
```

## 内置 hook

```typescript
import { useDynamicScript, useFederationComponent, loadComponent, RemoteComponent } from 'umi';
```
