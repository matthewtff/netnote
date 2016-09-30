import * as Net from "./net";

module Authentication {

const kCookieName = "mcl_user_cookie";

function IsProductionEnvironment(): boolean {
  return !document.location.port.length;
}

export function GetMatCatLabHost(): string {
  const host = "www.matcatlab.ru";
  return IsProductionEnvironment() ? host : host + ":8090";
}

export interface UserInfo {
  email: string;
  name: string;
  allow_subscriptions: boolean;
  sex?: string;
  birth_date?: string;
  region?: number;
  is_admin: boolean;
};

export interface UserInfoCallback {
  (info: UserInfo): any;
}

let g_user_info : UserInfo = null;

export function GetCookie(): string {
  const cookie_pairs = document.cookie.split("; ");
  let valid_cookie = "";
  cookie_pairs.forEach(cookie_pair => {
    const cookies = cookie_pair.split("=");
    if (cookies.length == 2 &&
        cookies[0] == kCookieName &&
        cookies[1].length > 0) {
      valid_cookie = cookies[1];
    }
  });
  return valid_cookie;
}

export function IsAuthorised(): boolean {
  const cookie = GetCookie();
  return cookie.length != 0;
}

export function LogOut(): void {
  document.cookie = kCookieName + "=; path=/; Max-Age=0; Domain=.matcatlab.ru";
  document.location.href = document.location.href;
}

export function GetUserInfo(callback: UserInfoCallback): void {
  if (!IsAuthorised()) {
    callback(undefined);
    return;
  }
  if (g_user_info) {
    callback(g_user_info);
    return;
  }

  new Net.Request({
    method: Net.Method.GET,
    url: `http://${GetMatCatLabHost()}/users/info`,
    success_callback: OnUserInfoReceived.bind(window, callback),
    failure_callback: OnUserInfoFailed.bind(window, callback),
  });
}

function OnUserInfoReceived(callback: UserInfoCallback,
                            response: {status: number, content: UserInfo}) {
  g_user_info = response.content;
  callback(response.content);
}

function OnUserInfoFailed(callback: UserInfoCallback, error: Error) {
  console.error(`Error fetching user info: ${error.message}`);
  callback(undefined);
}

};  // module Authentication

export = Authentication;
