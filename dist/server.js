"use strict";

var _express = _interopRequireDefault(require("express"));

var _routes = _interopRequireDefault(require("./routes/routes"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cors = _interopRequireDefault(require("cors"));

var _helmet = _interopRequireDefault(require("helmet"));

var _config = _interopRequireDefault(require("config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)();

var PORT = process.env.PORT || _config.default.get('PORT');

var DB_URL = _config.default.get('db.url');

_mongoose.default.Promise = global.Promise;

_mongoose.default.connect(DB_URL); // ---- SERVE STATIC FILES ---- //


app.use(function (req, res, next) {
  next();
}, _express.default.static("public"));
app.use((0, _cors.default)());
app.use((0, _helmet.default)());
app.use(_bodyParser.default.json({
  limit: "50mb"
}));
app.use(_bodyParser.default.urlencoded({
  limit: "50mb",
  // This limit is for avoid payload too large issue(When request contains base64 kind of files)
  extended: true,
  parameterLimit: 50000 // This limit is for avoid payload too large issue

}));
(0, _routes.default)(app);
app.listen(PORT, () => {
  console.log("you are server is running on ".concat(PORT));
});