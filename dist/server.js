"use strict";

var _express = _interopRequireDefault(require("express"));

var _routes = _interopRequireDefault(require("./routes/routes"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cors = _interopRequireDefault(require("cors"));

var _helmet = _interopRequireDefault(require("helmet"));

var _config = _interopRequireDefault(require("config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();

var PORT = _config["default"].get('PORT');

var DB_URL = _config["default"].get('db.url');

_mongoose["default"].Promise = global.Promise;

_mongoose["default"].connect(DB_URL);

app.use((0, _cors["default"])());
app.use((0, _helmet["default"])());
app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.use(_bodyParser["default"].json());
(0, _routes["default"])(app);
app.listen(PORT, function () {
  console.log("you are server is running on ".concat(PORT));
});