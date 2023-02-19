import { OnionMiddleware } from 'umi-request';

declare module 'umi-request' {
  /**
   * 流转换后的进度对象
   */
  export type StreamProgressEvent = {
    lengthComputable: boolean;
    loaded: number;
    total: number;
  };
  export interface RequestOptionsInit {
    /**
     * 上传进度事件的回调函数
     * @param {StreamProgressEvent} StreamProgressEvent - 进度对象
     * @param {boolean} StreamProgressEvent.lengthComputable - 是否可以被测量
     * @param {number} StreamProgressEvent.loaded - 已经执行的工作总量
     * @param {number} StreamProgressEvent.total - 工作总量
     */
    onDownloadProgress?: (progressEvent: StreamProgressEvent) => void;
  }
}

/**
 *
 * @param ctx
 * @param next
 * @returns
 */
const progressMiddleware: OnionMiddleware = async (ctx, next) => {
  const { req } = ctx;
  const { options } = req;
  const { onDownloadProgress, onUploadProgress } = options;

  if (onUploadProgress) {
  }
  await next();
  const { res } = ctx;

  if (onDownloadProgress && res) {
    const progressStream = res.clone();
    const total = +progressStream.headers.get('content-length')!;
    let loaded = 0;
    const reader = progressStream.body?.getReader();
    const processData = ({ value, done }) => {
      if (done) {
        return;
      }
      const length = value.length;
      loaded += length;
      onDownloadProgress({
        lengthComputable: !!total,
        loaded,
        total,
      });
      return reader?.read().then(processData);
    };
    reader?.read().then(processData);
  }
  return;
};

export default progressMiddleware;
