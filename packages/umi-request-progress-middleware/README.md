[umi-request]: https://github.com/umijs/umi-request

# 1. 介绍

fetch 并没有提供进度事件 umi-request 基于 fetch 也没有提供进度事件 umi-request-progress-middleware umi-request 的中间件 用于获取下载进度

`onDownloadProgress` 采用 stream 的方式实现获取下载进度

`onUploadProgress` 待实现

# 2. 安装方式

目前，安装方式有以下几种：

```bash
npm install umi-request-progress-middleware
yarn add umi-request-progress-middleware
```

# 3. 例子

`umi-request-progress-middleware` 扩展了 `RequestOptionsInit`

新增 `onDownloadProgress` 事件 获取下载进度

```typescript
type StreamProgressEvent = {
  lengthComputable: boolean;
  loaded: number;
  total: number;
};

interface RequestOptionsInit {
  /**
   * 下载进度事件的回调函数
   */
  onDownloadProgress?: (progressEvent: StreamProgressEvent) => void;

  // todo 上传进度事件待定
}

import request from 'umi-request';
import progressMiddleware from 'umi-request-progress-middleware';

// 注册内核中间件
request.use(progressMiddleware, { core: true });

// 请求
request(path, {
  // 获取下载进度
  onDownloadProgress: (progressEvent) => {
    console.log(((process.loaded / process.total) * 100).toFixed(2) + '%');
  },
});
```
