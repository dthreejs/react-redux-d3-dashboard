export function logout(): Object {
  return {
    type: 'LOGOUT',
    payload: Promise.resolve(),
  };
}

export function login({email, password}: Object, action: Function): Object {
  return action({
    type: 'LOGIN',
    payload: Promise.resolve({
      data: {
        user: {
          email,
          firstName: 'Firstname',
          lastName: 'Lastname',
          lang: 'en',
          role: 'ADMIN',
        },
      },
    }),
  });
}
