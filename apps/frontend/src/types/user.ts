/** A person as the API returns them. Never carries a password. */
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

/** Fields collected by the sign-up form. */
export interface SignUpFormValues {
  name: string
  email: string
  password: string
}

/** Fields collected by the login form. */
export interface LoginFormValues {
  email: string
  password: string
}
