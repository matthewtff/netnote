module Net {

export enum Method {
  DELETE,
  GET,
  PUT,
  POST,
}

function CanHavePayload(method: Method) {
  return method == Method.PUT || method == Method.POST;
}

export type Dictionary = {[key: string]: any};

export interface RequestInfo {
  method: Method;
  url: string;
  timeout?: number;
  parameters?: {[key: string]: any};
  success_callback:
      (response: {status: number, content: {[key: string]: any}}) => any;
  failure_callback: (error: Error) => any;
};

export class Request {
  private http_request_ : XMLHttpRequest;
  private info_: RequestInfo;
  private method_: Method;
  private url_: string;
  constructor(info: RequestInfo) {
    this.method_ = info.method;
    this.info_ = info;
    this.url_ = info.url;
    this.http_request_ = new XMLHttpRequest();

    let body: Object | string = null;

    if (info.parameters && !CanHavePayload(this.method_)) {
      this.url_ += "?" + Request.MakeQuery(info.parameters);
    }

    this.http_request_.addEventListener("load", this.OnLoad.bind(this));
    this.http_request_.addEventListener("error",
        this.OnError.bind(this, "Error loading " + this.url_));
    this.http_request_.addEventListener("timeout",
        this.OnError.bind(this,"Timeout out for " + this.url_));

    this.http_request_.withCredentials = true;

    if (info.timeout) {
      // Timeout should be between 1 and 20 seconds.
      this.http_request_.timeout =
          Math.max(1000, Math.min(20000, info.timeout));
    }

    this.http_request_.open(Method[this.method_], this.url_);
    if (info.parameters && CanHavePayload(this.method_)) {
      body = JSON.stringify(info.parameters);
      this.http_request_.setRequestHeader("Content-type", "application/json");
    }
    this.http_request_.send(body);
  }

  Cancel(): void {
    this.http_request_.abort();
  }

  static MakeQuery(dict: {[key: string]: any}): string {
    let request = "";
    for (const key in dict) {
      if (!dict.hasOwnProperty(key))
        continue;
      let pair = `${key}=${dict[key]}`;
      if (request.length > 0) {
        request += "&";
      }
      request += pair;
    }
    return request.replace("#", "%23");
  }

  private OnLoad(): void {
    let content = {};
    if (this.http_request_.responseText) {
      try {
        content = JSON.parse(this.http_request_.responseText);
      } catch (e) {
        this.info_.failure_callback(new Error("Failed to parse response"));
        return;
      }
    }
    this.info_.success_callback({
      status: this.http_request_.status,
      content: content,
    });
  }
  private OnError(message: string): void {
    this.info_.failure_callback(new Error(message));
  }
};  // class Request

};  // module Net

export = Net;
