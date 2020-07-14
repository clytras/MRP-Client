import isEmail from 'validator/lib/isEmail';
import isEmpty from 'validator/lib/isEmpty';
import isLength from 'validator/lib/isLength';
import { Strings } from '@mrplib/i18n/rn.js';
import { removeAllWhitespaces } from '@mrplib/utils';
import mrp from '@app/mrp';


export const validatePhoneNumber = ({
  number,
  minLength = 10,
  maxLength = 15
}) => {
  const check = removeAllWhitespaces(number);
  return check.length >= minLength &&
         check.length <= maxLength &&
         /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g.test(check);
}

export const validateLogin = ({
  email = '',
  password = ''
}) => {
  const { minPasswordLength } = mrp.auth;
  let errors = [], messages = [];

  if(!isEmail(email)) {
    const error = Strings.formatString(Strings.messages.Fields.IsInvalid, {
      field: Strings.titles.EMail.toLowerCase()
    });
    messages.push(error);
    errors.push({ field: 'email', error });
  }

  if(!isLength(password, { min: minPasswordLength })) {
    const error = Strings.formatString(Strings.messages.Fields.MustBeLengthOf, {
      field: Strings.titles.Password.toLowerCase(),
      len: minPasswordLength
    });
    messages.push(error);
    errors.push({ field: 'password', error });
  }

  return {
    errors,
    messages,
    valid: errors.length == 0
  }
}

export const validateRegister = ({
  name = '',
  surname = '',
  email = '',
  password = '',
  passwordConfirm = ''
}) => {
  let { errors, messages } = validateLogin({ email, password });

  if(name.length == 0) {
    const error = Strings.formatString(Strings.messages.Fields.MustNotBeEmpty, {
      field: Strings.titles.Name.toLowerCase(),
    });
    messages.push(error);
    errors.push({ field: 'name', error });
  }

  if(surname.length == 0) {
    const error = Strings.formatString(Strings.messages.Fields.MustNotBeEmpty, {
      field: Strings.titles.Surname.toLowerCase(),
    });
    messages.push(error);
    errors.push({ field: 'surname', error });
  }

  if(passwordConfirm.length > 0) {
    if(passwordConfirm !== password) {
      const error = Strings.formatString(Strings.messages.Fields.PasswordNotMatch);
      messages.push(error);
      errors.push({ field: 'passwordConfirm', error });
    }
  } else {
    const error = Strings.formatString(Strings.messages.Fields.MustNotBeEmpty, {
      field: Strings.titles.PasswordConfirmation.toLowerCase(),
    });
    messages.push(error);
    errors.push({ field: 'passwordConfirm', error });
  }

  let err = {};
  for(let error of errors) {
    err[error.field] = error;
  }

  return {
    errors,
    err,
    messages,
    valid: errors.length == 0
  }
}

export const validateChangePassword = ({
  // currentPassword,
  newPassword,
  confirmPassword
}) => {
  const { minPasswordLength } = mrp.auth;
  let errors = [], messages = [];

  // if(!isLength(currentPassword, { min: minPasswordLength })) {
  //   const error = Strings.formatString(Strings.messages.Fields.MustBeAtLeastLengthOf, {
  //     field: Strings.titles.CurrentPassword.toLowerCase(),
  //     len: minPasswordLength
  //   });
  //   messages.push(error);
  //   errors.push({ field: 'current', error });
  // }

  if(!isLength(newPassword, { min: minPasswordLength })) {
    const error = Strings.formatString(Strings.messages.Fields.MustBeAtLeastLengthOf, {
      field: Strings.titles.NewPassword.toLowerCase(),
      len: minPasswordLength
    });
    messages.push(error);
    errors.push({ field: 'new', error });
  }

  if(!isLength(confirmPassword, { min: minPasswordLength })) {
    const error = Strings.formatString(Strings.messages.Fields.MustBeAtLeastLengthOf, {
      field: Strings.titles.PasswordConfirmation.toLowerCase(),
      len: minPasswordLength
    });
    messages.push(error);
    errors.push({ field: 'confirm', error });
  } else if(confirmPassword !== newPassword) {
    const error = Strings.formatString(Strings.messages.Fields.PasswordNotMatch);
    messages.push(error);
    errors.push({ field: 'confirm', error });
  }

  let err = {};
  for(let error of errors) {
    err[error.field] = error;
  }

  return {
    errors,
    err,
    messages,
    valid: errors.length == 0
  }
}
