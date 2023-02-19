import { OnionMiddleware } from 'umi-request';
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
