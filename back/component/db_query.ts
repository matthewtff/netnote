import * as async from "async";
import * as ES6 from "es6-promise";
import * as pg from "pg";

import {Config, GetConfig} from "../base/configuration";
import {SecureString} from "../base/string_utils";

export type SecureType = SecureString | number | boolean;

function UnboxSecureString(value?: SecureType): any {
  if (typeof value === "number") {
    return value;
  } else if (typeof value === "boolean") {
    return value;
  } else if (value) {
    return value.toDBValue();
  }
}

type DoneCallback = (error?: Error) => void;

function Rollback(client: pg.Client, done: DoneCallback) {
  client.query('rollback', function(error: Error, result: pg.QueryResult) {
    //if there was a problem rolling back the query
    //something is seriously messed up.  Return the error
    //to the done function to close & remove this client from
    //the pool.  If you leave a client in the pool with an unaborted
    //transaction weird, hard to diagnose problems might happen.
    return done(error);
  });
};

function Commit(client: pg.Client, done: DoneCallback): void {
  client.query("commit", error => {
    done(error);
    if (error) {
      throw error;
    }
  });
}

export class DBQuery {
  static Transaction(
      queries: [string, SecureType[]][]): Promise<pg.QueryResult[]> {
    const settings = GetConfig().psql_settings;
    return new ES6.Promise<pg.QueryResult[]>((resolve, reject) => {
      pg.connect(settings,
        (error: Error, client: pg.Client, done: DoneCallback) => {
        const check_error = (error: Error) => {
          if (error) {
            if (client) done();
            reject(error);
            return true;
          }
          return false;
        };
        if (check_error(error))
          return;
        client.query("start transaction", function(err: Error) {
          if (err) {
            Rollback(client, done);
            return reject(err);
          }
          async.mapSeries(queries, (query, callback) => {
            const [commands, args] = query;
            const unboxed_values = args.map(UnboxSecureString);
            client.query(commands, unboxed_values, callback);
          }, (error, results) => {
            if (check_error(error)) {
              Rollback(client, done);
              return reject(error);
            }
            Commit(client, done);
            resolve(results as pg.QueryResult[]);
          })
        });
      })
    });
  }

  static Run(query: string, values: SecureType[]) : Promise<pg.QueryResult> {
    const settings = GetConfig().psql_settings;
    return new ES6.Promise<pg.QueryResult>((resolve, reject) => {
      pg.connect(settings,
                 (error: Error, client: pg.Client, done: DoneCallback) => {
        if (error) {
          if (client) {
            done();
          }
          return reject("Error connecting psql: " + error.message);
        }
        // Now extract out "secure" strings and make a real query.
        const unboxed_values = values.map(UnboxSecureString);
        client.query(query, unboxed_values,
                     (error: Error, result: pg.QueryResult) => {
          done();
          if (error)
            return reject("Error quering: " + query + "  ->  " + error.message);
          resolve(result);
        });
      })
    });
  } // ::Run
}  // class DBQuery
