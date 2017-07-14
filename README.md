### This should work like this:

authentication.js
```
  import authentication from 'feathers-authentication';
  import impersonateJWT from 'feathers-jwt-impersonate-verifier';

  .
  .
  .

  export default function() {
    const app = this;
    const config = app.get('authentication');

    app.configure(authentication(config));
    app.configure(impersonateJWT());

    .
    .
    .
  }
```
