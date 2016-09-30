import * as ES6 from "es6-promise";
import * as https from "https";
import * as querystring from "querystring";

module Mail {

export interface Info {
  from?: string;
  to: string[];
  subject?: string;
  text: string;
};  // interface MailInfo

export class Mailgun {
  private static from_: string = "kiwipoll@matcatlab.ru";
  private domain_: string;
  private host_: string;
  private key_: string;
  private path_: string;
  constructor(key?: string, domain?: string) {
    this.key_ = key ? key : "key-4b6c11fc9f157e7a47ae51dbca8816de";
    this.domain_ = domain ? domain : "matcatlab.ru";
    this.host_ = "api.mailgun.net";
    this.path_ = "/v3/" + this.domain_ + "/messages";
  }

  Send(info: Info): Promise<string> {
    let post_data = Mailgun.CreateQueryData(info);
    let post_options = {
      auth: "api:" + this.key_,
      host: this.host_,
      port: 443,
      path: this.path_,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(post_data)
      }
    };
    return new Promise<string>((resolve, reject) => {
      let response_data = '';
      let request = https.request(post_options, response => {
        response.setEncoding("utf8");
        response.on("data", (data: string) => {
          response_data += data;
          console.log("[Mail] Data: " + data);
        });
        response.on("end", (data?: string) => {
          if (data) {
            response_data += data;
          }
          resolve(response_data);
        });
      });
      request.on("error", (e: Error) => {
        reject("POST Request failed with: " + e.message);
      });
      request.write(post_data);
      request.end();
    });
  }

  private static CreateQueryData(info: Info): string {
    if (!info.from) {
      info.from = Mailgun.from_;
    }
    return querystring.stringify(info);
  }
}  // class Mailgun
}  // module Mail

export = Mail;
