"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose.default.Schema;
var UserSchema = new Schema({
  name: {
    type: String,
    required: 'Name required'
  },
  email: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  age: {
    type: Number,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  occupation: {
    type: String,
    required: false
  },
  caption: {
    type: String,
    required: false
  }
});
var _default = UserSchema;
exports.default = _default;