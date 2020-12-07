import { InjectionToken } from '@angular/core';
import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';
export const USER_DATA_KEY = new InjectionToken('skybrain-user-data-key');

export interface UserKeys {
  publicKey: string;
  privateKey: string;
  memoriesEncryptionKey: string;
  memoriesSkydbKey: string;
}

export interface UserData {
  nickname?: string;
  description?: string;
}

export interface UsersData {
  [userPublicKey: string]: UserData;
}

export type DataValidator<T> = {
  [P in keyof T]: string | true
};

export type ObjectKeys<T> = Array<keyof T>;

export function isValidatorValid<T>(validator: DataValidator<T>): boolean {
  const v = (Object.keys(validator) as ObjectKeys<T>).every(k => validator[k] === true);
  return v;
}

export const validateUserData = (data?: UserData): DataValidator<UserData> => {
  const valid: DataValidator<UserData>  = {};
  (Object.keys(data || {}) as ObjectKeys<UserData>).forEach((k) => valid[k] = !!data ? true : 'Empty user data');

  if (!data) {
    return valid;
  }

  if (!data.nickname || data.nickname.length < 4) {
    valid.nickname = 'The nickname cannot be empty and must be at least 4 characters long';
  }

  return valid;
};

export const userDataValidator: ValidatorFn = (fg: AbstractControl) => {
  const value = fg.value as UserData;
  const valid = validateUserData(value);
  (Object.keys(valid) as ObjectKeys<UserData>).forEach(k => valid[k] !== true && fg.get(k)?.setErrors( { invalid: valid[k] } ));
  return null;
};
