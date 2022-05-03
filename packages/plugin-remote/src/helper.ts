import { chain } from 'lodash';
export const normalizeRemotes = (remotes: Record<string, string>, filename) => {
  return chain(remotes)
    .toPairs()
    .reduce((p, [module, entry]) => {
      if (!entry.includes('@')) {
        entry = `${module}@${entry}`;
      }
      if (!entry.endsWith(filename)) {
        const urlArr = entry.match(/(^[^@]*@)?(.+)/);
        entry = `${urlArr[1]}${new URL(urlArr[2]).origin}/${filename}`;
      }
      return {
        ...p,
        [module]: entry,
      };
    }, {})
    .value();
};
