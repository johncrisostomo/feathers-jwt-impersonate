import jwt, { Verifier } from 'feathers-authentication-jwt';

class ImpersonateVerifier extends Verifier {
  async verify(request, payload, done) {
    // verify that the one requesting is an admin
    // get user from email / username / whatever
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

    // at this point request exists and has a valid roles
    // query the desired user to be impersonated
    // pass that user
    done(null, user, payload);
  }
}

export default function(options) {
  const defaultOptions = {
    name: 'impersonate',
    entity: 'user',
    service: 'users',
    passReqToCallback: true,
    rolesField: 'roles',
    allowedRole: 'admin',
    jwtFromRequest: [
      ExtractJwt.fromHeader,
      ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ExtractJwt.fromBodyField('body'),
    ],
    secretOrKey: auth.secret,
    session: false,
    Verifier: ImpersonateVerifier,
  };

  return jwt({ ...defaultOptions, ...options });
}
