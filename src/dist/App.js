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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
// import logo from "./logo.svg";
require("./App.css");
require("fontsource-metropolis/all.css");
var user_1 = require("./user");
var user = new user_1["default"]();
function App() {
    var _this = this;
    var _a = react_1.useState(""), secret = _a[0], setSecret = _a[1];
    var _b = react_1.useState(false), authenticated = _b[0], setAuthenticated = _b[1];
    // const [errorMessage, setErrorMessage] = useState("");
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(false), displaySuccess = _d[0], setDisplaySuccess = _d[1];
    var _e = react_1.useState([""]), userImages = _e[0], setUserImages = _e[1];
    var imageFile;
    var handleLogin = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var images, tempImages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setLoading(true);
                    return [4 /*yield*/, user.Login(secret)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, user.GetImages()];
                case 2:
                    images = _a.sent();
                    console.log(images);
                    tempImages = [];
                    images.forEach(function (img) {
                        tempImages.push("https://siasky.net/" + img.skylink.replace("sia:", ""));
                    });
                    setUserImages(tempImages);
                    setAuthenticated(true);
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleUpload = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    setLoading(true);
                    if (!imageFile) return [3 /*break*/, 2];
                    return [4 /*yield*/, user.AddImage(imageFile)];
                case 1:
                    img = _a.sent();
                    setUserImages(__spreadArrays(["https://siasky.net/" + img.replace("sia:", "")], userImages));
                    setDisplaySuccess(true);
                    _a.label = 2;
                case 2:
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var onImageChange = function (e) {
        var files = Array.from(e.target.files);
        if (files) {
            if (files[0]) {
                imageFile = files[0];
            }
        }
    };
    return (react_1["default"].createElement("div", { className: "App" },
        react_1["default"].createElement("header", { className: "App-header" },
            react_1["default"].createElement("div", { className: "container" },
                react_1["default"].createElement("h1", null, "Instasia"),
                authenticated ? (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { htmlFor: "output" }, "Upload an image"),
                    react_1["default"].createElement("div", { className: "flex" },
                        react_1["default"].createElement("input", { type: "file", onChange: onImageChange })),
                    react_1["default"].createElement("div", { className: "mb-4" },
                        react_1["default"].createElement("button", { type: "button", onClick: handleUpload, disabled: loading }, loading ? "Uploading..." : "Upload"),
                        displaySuccess && (react_1["default"].createElement("span", { className: "success-message" }, "Uploaded with success!"))),
                    react_1["default"].createElement("div", null, userImages ?
                        userImages.map(function (image, index) { return react_1["default"].createElement("p", { key: index },
                            react_1["default"].createElement("img", { width: "300", key: index, src: image, alt: "info" })); }) : react_1["default"].createElement("div", null)))) : (react_1["default"].createElement("form", { onSubmit: handleLogin },
                    react_1["default"].createElement("div", { className: "mb-2" },
                        react_1["default"].createElement("label", { htmlFor: "output" }, "Login passphrase"),
                        react_1["default"].createElement("div", { className: "flex" },
                            react_1["default"].createElement("input", { id: "output", type: "secret", placeholder: "Your very secret passphrase", value: secret, onChange: function (event) { return setSecret(event.target.value); } }))),
                    react_1["default"].createElement("div", { className: "mb-4" },
                        react_1["default"].createElement("button", { disabled: loading }, loading ? "Logging..." : "Login"))))))));
}
exports["default"] = App;
