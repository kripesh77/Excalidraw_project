export interface SigninFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

export interface CreateRoomFormData {
  create: string;
}

export interface JoinRoomFormData {
  join: string;
}

export interface ActionErrors {
  [key: string]: string | undefined;
}

export interface SigninActionState {
  error?: ActionErrors;
  formData?: SigninFormData;
}

export interface SignupActionState {
  error?: ActionErrors;
  formData?: SignupFormData;
}

export interface CreateRoomActionState {
  error?: ActionErrors;
  formData?: CreateRoomFormData;
}

export interface JoinRoomActionState {
  error?: ActionErrors;
  formData?: JoinRoomFormData;
}
