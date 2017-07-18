'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _feathersAuthenticationJwt = require('feathers-authentication-jwt');

var _feathersAuthenticationJwt2 = _interopRequireDefault(_feathersAuthenticationJwt);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('feathers-jwt-impersonate');

class ImpersonateVerifier extends _feathersAuthenticationJwt.Verifier {
  verify(request, payload, done) {
    var _this = this;

    return _asyncToGenerator(function* () {
      debug('Received JWT payload', payload);

      const requesterId = payload[`${_this.options.entity}Id`];

      if (!requesterId) {
        debug(`JWT payload does not contain ${_this.options.entity}Id`);
        return done(null, {}, payload);
      }

      let requester;

      try {
        requester = yield _this.service.get(requesterId);
      } catch (err) {
        debug(`Error getting ${_this.options.entity} with id ${requesterId}`, error);
        return done(null, {}, payload);
      }

      if (!requester[`${_this.options.rolesField}`].includes(`${_this.options.allowedRole}`)) {
        debug(`Role ${_this.options.allowedRole} is not included in ${_this.options.entity} ${_this.options.rolesField}`);
        return done(null, {}, payload);
      }

      let targetUser;

      debug(`Looking up ${_this.options.entity} by id`, request.query.userId);

      try {
        targetUser = yield _this.service.get(request.query.userId);
        payload.userId = targetUser._id;

        return done(null, targetUser, payload);
      } catch (error) {
        // at this point there is an error or the target id is not found
        debug(`Error populating ${_this.options.entity} with id ${request.query.userId}`, error);
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
