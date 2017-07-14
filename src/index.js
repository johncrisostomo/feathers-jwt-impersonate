import jwt, { Verifier } from 'feathers-authentication-jwt';

class ImpersonateVerifier extends Verifier {
  verify(request, payload, done) {
    // verify that the one requesting is an admin
    // get user from email / username / whatever
    done(null, user, payload);
  }
}

export default function(options) {
  const defaultOptions = {
    name: 'impersonate',
    entity: 'user',
    service: 'users',
    passReqToCallback: true,
    jwtFromRequest: [
      ExtractJwt.fromHeader,
      ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ExtractJwt.fromBodyField('body')
    ],
    secretOrKey: auth.secret,
    session: false,
    Verifier: ImpersonateVerifier
};


  return jwt({ ...defaultOptions, ...options });
}
