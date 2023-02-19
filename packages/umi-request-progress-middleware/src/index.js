"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const progressMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { req } = ctx;
    const { options } = req;
    const { onDownloadProgress, onUploadProgress } = options;
    if (onUploadProgress) {
    }
    yield next();
    const { res } = ctx;
    if (onDownloadProgress && res) {
        const progressStream = res.clone();
        const total = +progressStream.headers.get('content-length');
        let loaded = 0;
        const reader = (_a = progressStream.body) === null || _a === void 0 ? void 0 : _a.getReader();
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
            return reader === null || reader === void 0 ? void 0 : reader.read().then(processData);
        };
        reader === null || reader === void 0 ? void 0 : reader.read().then(processData);
    }
    return;
});
exports.default = progressMiddleware;
//# sourceMappingURL=index.js.map