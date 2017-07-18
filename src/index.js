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

    let targetUser;

    try {
      targetUser = await this.service.get(request.query.userId);
      payload.userId = targetUser._id;

      return done(null, targetUser, payload);
    } catch (error) {
      // at this point there is an error or the target id is not found
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
