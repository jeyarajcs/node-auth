"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addNewUser = addNewUser;
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.addAdmin = addAdmin;
exports.verifyAdmin = verifyAdmin;
exports.login = login;

var _config = _interopRequireDefault(require("config"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _nodemailerSendgridTransport = _interopRequireDefault(require("nodemailer-sendgrid-transport"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _users = _interopRequireDefault(require("../models/users"));

var _admin = _interopRequireDefault(require("../models/admin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var JWTSecret = _config.default.get('jwt.secret');

var JWTExpiry = _config.default.get('jwt.expiryTime');

var SENDGRID_APIKEY = _config.default.get('sendGrid.apiKey');

var SENDGRID_EMAIL = _config.default.get('sendGrid.fromEmail');

var VERIFICATION_URL = _config.default.get('verificationURL');

var User = _mongoose.default.model('User', _users.default);

var Admin = _mongoose.default.model('Admin', _admin.default); // add new user to the database


function addNewUser(req, res) {
  var newUser = new User(req.body);
  newUser.save((error, user) => {
    if (error) {
      res.json(error);
    }

    res.send({
      status: "success",
      data: user
    });
  });
} // get all users from the database


function getUsers(req, res) {
  User.find({}, (error, users) => {
    if (error) {
      res.json(error);
    }

    res.send({
      status: "success",
      data: users
    });
  });
} // get single user based on the id


function getUser(req, res) {
  User.findById(req.params.id, (error, user) => {
    if (error) {
      res.json(error);
    }

    res.send({
      status: "success",
      data: user
    });
  });
} // update the user information based on id


function updateUser(req, res) {
  User.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true
  }, (error, user) => {
    if (error) {
      res.json(error);
    }

    sendMail(user, "updateNotification").then(data => {
      res.send({
        status: "success",
        data: user
      });
    }).catch(e => {
      res.json(e);
    });
  });
} // delete the user from the database.


function deleteUser(req, res) {
  User.remove({
    _id: req.params.id
  }, (error, user) => {
    if (error) {
      res.json(error);
    }

    res.send({
      status: "success",
      data: user
    });
  });
} // add new Admin User to the database


function addAdmin(req, res) {
  req.body.role = "admin";
  var newAdmin = new Admin(req.body);
  newAdmin.save((error, admin) => {
    if (error) {
      res.json(error);
    }

    sendMail(admin, "emailVerification").then(data => {
      res.send({
        status: "success",
        message: "Verification mail has been sent to your email.",
        data: data
      });
    }).catch(e => {
      res.json(e);
    });
  });
} // verify Admin User to the database


function verifyAdmin(req, res) {
  _jsonwebtoken.default.verify(req.params.token, JWTSecret, (err, decoded) => {
    if (err) {
      res.json({
        status: "error",
        message: "Email verification failed"
      });
    } else {
      var filter = {
        email: decoded.email,
        role: decoded.role,
        isEmailVerified: false
      };
      Admin.findOneAndUpdate(filter, {
        $set: {
          "isEmailVerified": true
        }
      }, (error, admin) => {
        if (error) {
          res.json(error);
        }

        res.send({
          status: "success",
          message: "Email verified successfully"
        });
      });
    }
  });
} // login


function login(req, res) {
  var admin = {
    email: req.body.email,
    password: req.body.password,
    isEmailVerified: true
  };
  Admin.findOne(admin, (error, admin) => {
    if (error) {
      res.json(error);
    }

    if (admin && admin != null) {
      res.send({
        status: "success",
        token: generateJWT(admin)
      });
    } else {
      res.send({
        status: "error",
        message: "Invalid Email/Password. If already registered, please verify your email."
      });
    }
  });
}

function generateJWT(data) {
  try {
    var payload = {
      email: data.email,
      role: data.role
    };

    var token = _jsonwebtoken.default.sign(payload, JWTSecret, {
      expiresIn: JWTExpiry
    });

    return token;
  } catch (e) {
    return e;
  }
} //Send email


function sendMail(_x, _x2) {
  return _sendMail.apply(this, arguments);
}

function _sendMail() {
  _sendMail = _asyncToGenerator(function* (admin, purpose) {
    try {
      var htmlContent = "";
      var textContent = "";

      if (purpose && purpose == "emailVerification") {
        var token = generateJWT(admin);
        textContent = "Email Verification";
        htmlContent = "<a href=".concat(VERIFICATION_URL, "/admin/verification/").concat(token, ">Click to verify</a>");
      } else if (purpose && purpose == "updateNotification") {
        textContent = "Update Notification";
        htmlContent = "<h4>Your data that associate with ".concat(admin.email, " has been updated.</h4>");
      } else {
        htmlContent = "<h4>Dummy</h4>";
        textContent = "Dummy";
      }

      var account = yield _nodemailer.default.createTestAccount();
      var options = {
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass
        }
      }; // create reusable transporter object using the default SMTP transport

      var transporter = _nodemailer.default.createTransport(options); // send mail with defined transport object


      var info = yield transporter.sendMail({
        from: 'admin@nodeauth.com',
        // sender address
        to: admin.email,
        // list of receivers
        subject: textContent,
        // Subject line
        text: textContent,
        // plain text body
        html: htmlContent // html body

      });
      return {
        emailInfo: info,
        emailURL: _nodemailer.default.getTestMessageUrl(info)
      };
    } catch (e) {
      return e;
    }
  });
  return _sendMail.apply(this, arguments);
}