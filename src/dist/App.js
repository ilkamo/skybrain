var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++)
      s += arguments[i].length;
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
var evergreen_ui_1 = require("evergreen-ui");
var user = new user_1["default"]();
function App() {
  var _this = this;
  var _a = react_1.useState(""),
    secret = _a[0],
    setSecret = _a[1];
  var _b = react_1.useState(false),
    authenticated = _b[0],
    setAuthenticated = _b[1];
  // const [errorMessage, setErrorMessage] = useState("");
  var _c = react_1.useState(false),
    loading = _c[0],
    setLoading = _c[1];
  var _d = react_1.useState(false),
    uploading = _d[0],
    setUploading = _d[1];
  var _e = react_1.useState(false),
    deleting = _e[0],
    setDeleting = _e[1];
  var _f = react_1.useState(false),
    displaySuccess = _f[0],
    setDisplaySuccess = _f[1];
  var _g = react_1.useState([""]),
    userImages = _g[0],
    setUserImages = _g[1];
  var imageFile;
  var handleLogin = function (event) {
    return __awaiter(_this, void 0, void 0, function () {
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
            tempImages = [];
            images.forEach(function (img) {
              tempImages.push(img.skylink.replace("sia:", ""));
            });
            setUserImages(tempImages);
            setAuthenticated(true);
            setLoading(false);
            return [2 /*return*/];
        }
      });
    });
  };
  var handleUpload = function (event) {
    return __awaiter(_this, void 0, void 0, function () {
      var img;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            event.preventDefault();
            setUploading(true);
            if (!imageFile) return [3 /*break*/, 2];
            return [4 /*yield*/, user.AddImage(imageFile)];
          case 1:
            img = _a.sent();
            setUserImages(
              __spreadArrays([img.replace("sia:", "")], userImages)
            );
            setDisplaySuccess(true);
            _a.label = 2;
          case 2:
            setUploading(false);
            return [2 /*return*/];
        }
      });
    });
  };
  var onImageDelete = function (event) {
    return __awaiter(_this, void 0, void 0, function () {
      var skylink, foundIndex;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            skylink = event.target.id;
            setDeleting(true);
            return [4 /*yield*/, user.DeleteImage(skylink)];
          case 1:
            _a.sent();
            foundIndex = userImages.findIndex(function (img) {
              return img.search(skylink) > -1;
            });
            if (foundIndex > -1) {
              setUserImages(
                __spreadArrays(
                  userImages.slice(0, foundIndex),
                  userImages.slice(foundIndex + 1)
                )
              );
            }
            setDeleting(false);
            return [2 /*return*/];
        }
      });
    });
  };
  var onImageChange = function (files) {
    if (files) {
      if (files[0]) {
        imageFile = files[0];
      }
    }
  };
  return react_1["default"].createElement(
    "div",
    { className: "App" },
    react_1["default"].createElement(
      evergreen_ui_1.Pane,
      { marginLeft: "auto", marginRight: "auto" },
      react_1["default"].createElement(
        evergreen_ui_1.Heading,
        { textAlign: "center", size: 900, marginTop: "default" },
        "Instasia"
      ),
      !authenticated
        ? react_1["default"].createElement(
            evergreen_ui_1.Heading,
            { textAlign: "center", size: 500, marginTop: 8 },
            "Collect your memories!"
          )
        : "",
      authenticated
        ? react_1["default"].createElement(
            evergreen_ui_1.Pane,
            { marginLeft: "auto", marginRight: "auto", width: 640 },
            react_1["default"].createElement(
              evergreen_ui_1.Pane,
              {
                elevation: 3,
                marginTop: 16,
                marginBottom: 32,
                padding: 32,
                borderRadius: 3,
              },
              react_1["default"].createElement(
                evergreen_ui_1.Heading,
                { size: 500, marginBottom: 16 },
                "Upload a memory"
              ),
              react_1["default"].createElement(
                evergreen_ui_1.Pane,
                { display: "flex", alignItems: "left" },
                react_1["default"].createElement(evergreen_ui_1.FilePicker, {
                  multiple: false,
                  width: 350,
                  marginBottom: 8,
                  onChange: function (files) {
                    return onImageChange(files);
                  },
                  placeholder: "Select the file here!",
                }),
                react_1["default"].createElement(
                  evergreen_ui_1.Button,
                  {
                    height: 32,
                    isLoading: uploading,
                    onClick: handleUpload,
                    marginLeft: 16,
                    appearance: "primary",
                    intent: "success",
                    iconBefore: evergreen_ui_1.UploadIcon,
                  },
                  "Upload"
                )
              )
            ),
            userImages
              ? userImages.map(function (image, index) {
                  var imageWithProtocol =
                    "https://siasky.net/" + image.replace("sia:", "");
                  return react_1["default"].createElement(
                    evergreen_ui_1.Pane,
                    { key: index, elevation: 0, marginBottom: 36 },
                    react_1["default"].createElement("img", {
                      width: "100%",
                      id: image,
                      key: index,
                      src: imageWithProtocol,
                      alt: "info",
                    }),
                    react_1["default"].createElement(
                      evergreen_ui_1.Button,
                      {
                        id: image,
                        isLoading: deleting,
                        margin: 12,
                        height: 32,
                        onClick: onImageDelete,
                        appearance: "minimal",
                        intent: "danger",
                        iconBefore: evergreen_ui_1.TrashIcon,
                      },
                      "Delete"
                    )
                  );
                })
              : react_1["default"].createElement("div", null)
          )
        : react_1["default"].createElement(
            "div",
            null,
            react_1["default"].createElement(
              evergreen_ui_1.Pane,
              {
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 32,
                width: 300,
              },
              react_1["default"].createElement(
                evergreen_ui_1.Pane,
                null,
                react_1["default"].createElement("img", {
                  src: "https://source.unsplash.com/collection/1689441/300x200",
                  alt: "random",
                })
              ),
              react_1["default"].createElement(
                evergreen_ui_1.Pane,
                { width: 300, elevation: 0, padding: 24 },
                react_1["default"].createElement(
                  evergreen_ui_1.TextInputField,
                  {
                    label: "Login passphrase",
                    description:
                      "A secure passphrase to login into your account. Remember it! It is the only way to access your stored memories.",
                    placeholder: "Your very secret passphrase",
                    onChange: function (event) {
                      return setSecret(event.target.value);
                    },
                    value: secret,
                    type: "password",
                  }
                ),
                react_1["default"].createElement(
                  evergreen_ui_1.Button,
                  {
                    isLoading: loading,
                    height: 48,
                    onClick: handleLogin,
                    appearance: "minimal",
                    intent: "success",
                    iconBefore: evergreen_ui_1.LogInIcon,
                  },
                  "Login"
                )
              )
            )
          ),
      react_1["default"].createElement(
        evergreen_ui_1.Heading,
        { textAlign: "center", size: 200, marginTop: "default" },
        "This service works using SkyDB and Skynet technology \u2764."
      )
    )
  );
}
exports["default"] = App;
