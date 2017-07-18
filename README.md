# feathers-jwt-impersonate
[![Build Status](https://travis-ci.org/johncrisostomo/feathers-jwt-impersonate.svg?branch=master)](https://travis-ci.org/johncrisostomo/feathers-jwt-impersonate)

**DISCLAIMER**: Use this at your own risk. This is a very early prototype, **and only works with REST by hitting the `/authentication` endpoint directly**.

This is a [feathers-authentication](https://github.com/feathersjs/feathers-authentication) plugin that implements user impersonation. It is just a simple custom verifier that sits on top of [feathers-authentication-jwt](https://github.com/feathersjs/feathers-authentication-jwt). As such, the default options are the same, except for these ones:

```
{
  name: 'impersonate',
  entity: 'user',
  service: 'users',
  rolesField: 'roles',
  allowedRole: 'admin',
  Verifier: ImpersonateVerifier,
}
```

This is a very crude/simple solution, but it works right now. will add tests as soon as time permits.

## Installation:
  `yarn add feathers-jwt-impersonate`

  or

  `npm install feathers-jwt-impersonate --save`

## Usage:

### authentication.js
```
  import authentication from 'feathers-authentication';
  import impersonate from 'feathers-jwt-';

  .
  .
  .

  export default function() {
    const app = this;
    const config = app.get('authentication');

    app.configure(authentication(config));
    app.configure(impersonate());

    .
    .
    .
  }

  app.service('authentication').hooks({
    before: {
      create: [authentication.hooks.authenticate(['impersonate'])],
    },
  });
```

### Expected Payload
```
{
	"strategy": "impersonate",
	"userId": "596d4832c816ca24a29b1b81" // userId of the user that you want to impersonate
}
```

PRs and code reviews are welcome to make this more generic / acceptable to use for a wide variety of cases.
