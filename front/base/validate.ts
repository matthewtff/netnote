module Validate {

// Checks if email is valid. Returns |true| if so.
export function ValidateEmail(email: string): boolean {
  if (!email)
    return false;
  const at_index = email.indexOf('@');
  return email.length > 2 && at_index > 0 && at_index < (email.length - 1);
}

}  // module Validate

export = Validate;
