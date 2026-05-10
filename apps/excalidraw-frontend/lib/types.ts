export interface SigninFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

export interface AuthActionErrors {
  [key: string]: string | undefined;
}

export interface SigninActionState {
  error?: AuthActionErrors;
  formData?: SigninFormData;
}

export interface SignupActionState {
  error?: AuthActionErrors;
  formData?: SignupFormData;
}
