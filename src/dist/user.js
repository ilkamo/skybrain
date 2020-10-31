"use strict";
/* eslint-disable no-unused-expressions */
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
exports.__esModule = true;
var skynet_js_1 = require("skynet-js");
var skynetClient = new skynet_js_1.SkynetClient("https://siasky.net");
var userDataKey = "userData.json";
var userImagesDataKey = "userImages.json";
var nickNameKey = "nickname";
var User = /** @class */ (function () {
    function User() {
        this.nickname = "";
        this.authenticated = false;
    }
    User.prototype.Login = function (passphrase) {
        return __awaiter(this, void 0, Promise, function () {
            var _a, publicKey, privateKey, data, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = skynet_js_1.keyPairFromSeed(passphrase), publicKey = _a.publicKey, privateKey = _a.privateKey;
                        this.publicKey = publicKey;
                        this.privateKey = privateKey;
                        this.authenticated = true;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, skynetClient.db.getJSON(publicKey, userDataKey)];
                    case 2:
                        data = (_b.sent()).data;
                        if (data && nickNameKey in data) {
                            this.nickname = data[nickNameKey];
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _b.sent();
                        console.log(error_1);
                        console.log("no user with the given passphrase, setting new one");
                        return [4 /*yield*/, this.SetNickname(this.nickname)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    User.prototype.IsAuthenticated = function () {
        return this.authenticated;
    };
    User.prototype.Nickname = function () {
        return this.nickname;
    };
    User.prototype.SetNickname = function (nickname) {
        return __awaiter(this, void 0, Promise, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, skynetClient.db.setJSON(this.privateKey, userDataKey, { nickname: nickname })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.log(error_2);
                        console.log("could not set nickname");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    User.prototype.GetImages = function () {
        return __awaiter(this, void 0, Promise, function () {
            var data, ui, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, skynetClient.db.getJSON(this.publicKey, userImagesDataKey)];
                    case 1:
                        data = (_a.sent()).data;
                        if (data) {
                            ui = JSON.parse(data);
                            return [2 /*return*/, ui];
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _a.sent();
                        console.log(error_3);
                        console.log("no user images, init");
                        return [4 /*yield*/, this.initImages()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, []];
                }
            });
        });
    };
    User.prototype.AddImage = function (file) {
        return __awaiter(this, void 0, Promise, function () {
            var skylink, images, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 6]);
                        return [4 /*yield*/, skynetClient.uploadFile(file)];
                    case 1:
                        skylink = _a.sent();
                        return [4 /*yield*/, this.GetImages()];
                    case 2:
                        images = _a.sent();
                        images.unshift({
                            added: new Date(Date.now()),
                            skylink: skylink
                        });
                        return [4 /*yield*/, skynetClient.db.setJSON(this.privateKey, userImagesDataKey, JSON.stringify(images))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, skylink];
                    case 4:
                        error_4 = _a.sent();
                        console.log(error_4);
                        console.log("no user images, init");
                        return [4 /*yield*/, this.initImages()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, ""];
                }
            });
        });
    };
    User.prototype.initImages = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, skynetClient.db.setJSON(this.privateKey, userImagesDataKey, JSON.stringify([]))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.log(error_5);
                        console.log("could not init user images");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return User;
}());
exports["default"] = User;
