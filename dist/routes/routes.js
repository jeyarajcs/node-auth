"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _users = require("../controllers/users");

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _config = _interopRequireDefault(require("config"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var JWTSecret = _config["default"].get('jwt.secret');

var routes = function routes(app) {
  app.route('/').get(function (req, res) {
    res.sendFile('index.html', {
      root: "./public"
    });
  });
  app.route('/user').get(_users.getUsers).post(_users.addNewUser);
  app.route('/user/:id').get(_users.getUser).put(checkTokenAuthentication, _users.updateUser)["delete"](checkTokenAuthentication, _users.deleteUser);
  app.route('/admin/register').post(_users.addAdmin);
  app.route('/admin/verification/:token').get(_users.verifyAdmin);
  app.route('/admin/login').post(_users.login);
};

function checkTokenAuthentication(req, res, next) {
  var jwttoken = req.body.jwttoken || req.query.jwttoken || req.headers['x-access-token'];

  if (jwttoken) {
    _jsonwebtoken["default"].verify(jwttoken, JWTSecret, function (err, decoded) {
      if (err) {
        res.send({
          status: "error",
          message: "Failed to authenticate token."
        });
      } else {
        next();
      }
    });
  } else {
    res.send({
      status: "error",
      message: "No token provided."
    });
  }
}

var _default = routes;
exports["default"] = _default;