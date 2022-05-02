# `@matt-umi/plugin-remote

> TODO: umi webpack5 moduleFederation

## Usage

```typescript
{
	plugins:['@matt-umi/plugin-remote'],
	remote:{
		name:'moduleName',  // 应用名称
		filename:'remoteEntry.js',  //  默认暴露的文件名
		exposes:{
			expose:'./src/expose'  // 模块名称
		},
		shared:['react'] // 共享依赖 默认react react-router lodash
	}
}
```
