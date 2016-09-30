import * as ES6 from "es6-promise";
import * as http from "http";

import * as Configuration from "../base/configuration";

module UserBase {

export interface UserInfo {
  allow_subscriptions: string;
  birth_date?: string;
  email: string;
  name: string;
  sex?: string;
  region?: string;
  is_admin: boolean;
};

const kMaxCachedUsersNumber = 200;

function GetMCLOrigin() {
  let origin = "www.matcatlab.ru";
  if (!Configuration.IsProductionEnvironment()) {
    origin += ":8090";
  }
  return origin;
}

let g_users: {[cookie: string]: UserInfo} = {};
let g_number_of_cached_users = 0;

export function GetUserInfo(cookie: string): Promise<UserInfo> {
  return new ES6.Promise<UserInfo>((resolve, reject) => {
    if (cookie.length < 30)
      return reject('Invalid cookie');
    if (g_users[cookie])
      return resolve(g_users[cookie]);
    http.get(`http://${GetMCLOrigin()}/users/info/${cookie}`, (res) => {
      if (res.statusCode != 200)
        return reject("Unable to find user");
      res.setEncoding("utf8");
      res.on("data", (data: string) => {
        try {
          const user_info: UserInfo = JSON.parse(data);
          if (g_number_of_cached_users < kMaxCachedUsersNumber) {
            g_users[cookie] = user_info;
          }
          resolve(user_info);
        } catch (e) {
          return reject(e);
        }
      });
    }).on('error', reject);
  });
}

};  // module UserBase

export = UserBase;
