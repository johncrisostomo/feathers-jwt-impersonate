'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _feathersAuthenticationJwt = require('feathers-authentication-jwt');

var _feathersAuthenticationJwt2 = _interopRequireDefault(_feathersAuthenticationJwt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class ImpersonateVerifier extends _feathersAuthenticationJwt.Verifier {
  verify(request, payload, done) {
    var _this = this;

    return _asyncToGenerator(function* () {
      console.log(request);
      const requesterId = payload[`${_this.options.entity}Id`];

      if (!requesterId) {
        return done(null, {}, payload);
      }

      const requester = yield _this.service.get(requesterId);

      if (!requester) {
        return done(null, {}, payload);
      }

      if (!requester[`${_this.options.rolesField}`].includes(`${_this.options.allowedRole}`)) {
        return done(null, {}, payload);
      }

      let targetUser;

      try {
        targetUser = yield _this.service.get(request.query.userId);
        payload.userId = targetUser._id;
        console.log(targetUser);
        return done(null, targetUser, payload);
      } catch (error) {
        // at this point there is an error or the target id is not found
        console.log(error);
        return done(null, {}, payload);
      }
    })();
  }
}

module.exports = function (options = {}) {
  const impersonateOptions = {
    name: 'impersonate',
    entity: 'user',
    service: 'users',
    rolesField: 'roles',
    allowedRole: 'admin',
    Verifier: ImpersonateVerifier
  };

  return (0, _feathersAuthenticationJwt2.default)(_extends({}, impersonateOptions, options));
};
