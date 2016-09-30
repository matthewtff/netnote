module StringUtils {

export function RandomString(length: number): string {
  let allowed_characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let result = "";
  for (let i = 0; i < length; ++i) {
    let character_index = Math.floor(Math.random() * allowed_characters.length);
    result += allowed_characters[character_index];
  }
  return result;
}

export class SecureString {
  private value_: string;
  constructor(value: string) {
    this.value_ = value;
  }
  toString(): string {
    return this.value_;
  }
  toDBValue(): string | Object {
    return this.IsEmpty() ? null : this.value_;
  }
  getObject(index: number): String {
    return this.value_[index];
  }
  length(): number {
    return this.value_.length;
  }
  IsEmpty() : boolean {
    return !(this.length() > 0);
  }
}

export function MakeSecure(
    value: string,
    validate: (value: string) => boolean,
    default_value: string): SecureString {
  if (!value || !validate(value))
    return new SecureString(default_value);
  return new SecureString(value);
}

export function GetAndValidate<T>(
    value: string,
    validate: (value: string) => boolean,
    default_value: T): string | T {
  if (!value || !validate(value))
    return default_value;
  return value;
}

}  // module StringUtils

export = StringUtils;
