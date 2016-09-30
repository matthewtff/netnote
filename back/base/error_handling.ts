import * as express from "express";

import {IsProductionEnvironment} from "./configuration";

module ErrorHandling {

enum LogSeverity { kLog, kInfo, kWarning, kError };

export const kBadArgumentsError = "Bad arguments supplied";

export function Log(severity: LogSeverity, ...args: any[]): void {
  let log_function = () => {};
  switch (severity) {
    case LogSeverity.kLog:
      log_function = console.log;
      break;
    case LogSeverity.kInfo:
      log_function = console.info;
      break;
    case LogSeverity.kWarning:
      log_function = console.warn;
      break;
    case LogSeverity.kError:
      log_function = console.error;
      break;
  }
  log_function.apply(console, args);
}

export function Assert(assertion: boolean, message: string): void {
  console.assert(assertion, message);
}

// Usually it should be used like this:
//
// export function MyCoolApi(request, response) {
//   const on_error = CreateErrorHandler(response);
//   FunReturningPromise().then(() => response.end('OK')).catch(on_error);
// }
export function CreateErrorHandler(
    response: express.Response,
    message = kBadArgumentsError): (error: Error | string) => void {
  const on_error = (error: Error | string) => {
    Log(LogSeverity.kError, error);
    response.status(400);
    // Pass real error only in development mode.
    if (!IsProductionEnvironment()) {
      message = (typeof error === "object") ? error.message : message = error;
    }
    response.end(message);
  }
  return on_error;
}

}  // module ErrorHandling

export = ErrorHandling;
