import jwt, { Verifier } from 'feathers-authentication-jwt';

class ImpersonateVerifier extends Verifier {
  async verify(request, payload, done) {
    const requesterId = payload[`${this.options.entity}Id`];

    if (!requesterId) {
      return done(null, {}, payload);
    }

    const requester = await this.service.get(requesterId);

    if (!requester) {
      return done(null, {}, payload);
    }

    if (
      !requester[`${this.options.rolesField}`].includes(
        `${this.options.allowedRole}`,
      )
    ) {
      return done(null, {}, payload);
    }

    const targetUser = await this.service.find({ email: request.query.email });
    done(null, targetUser, payload);
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
