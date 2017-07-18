import jwt, { Verifier } from 'feathers-authentication-jwt';
import Debug from 'debug';

const debug = Debug('feathers-jwt-impersonate-verifier');

class ImpersonateVerifier extends Verifier {
  async verify(request, payload, done) {
    debug('Received JWT payload', payload);

    const requesterId = payload[`${this.options.entity}Id`];

    if (!requesterId) {
      debug(`JWT payload does not contain ${this.options.entity}Id`);
      return done(null, {}, payload);
    }

    let requester;

    try {
      requester = await this.service.get(requesterId);
    } catch (err) {
      debug(`Error getting ${this.options.entity} with id ${requesterId}`, error);
      return done(null, {}, payload);
    }

    if (!requester[`${this.options.rolesField}`].includes(`${this.options.allowedRole}`)) {
      debug(`Role ${this.options.allowedRole} is not included in ${this.options.entity} ${this.options.rolesField}`);
      return done(null, {}, payload);
    }

    let targetUser;

    debug(`Looking up ${this.options.entity} by id`, request.query.userId);

    try {
      targetUser = await this.service.get(request.query.userId);
      payload.userId = targetUser._id;

      return done(null, targetUser, payload);
    } catch (error) {
      // at this point there is an error or the target id is not found
      debug(`Error populating ${this.options.entity} with id ${requesterId}`, error);
      return done(null, {}, payload);
    }
  }
}

module.exports = function(options = {}) {
  const impersonateOptions = {
    name: 'impersonate',
    entity: 'user',
    service: 'users',
    rolesField: 'roles',
    allowedRole: 'admin',
    Verifier: ImpersonateVerifier,
  };

  return jwt({ ...impersonateOptions, ...options });
};
