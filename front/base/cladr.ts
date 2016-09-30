import {GetMatCatLabHost} from "./authentication";
import * as Net from "./net";

module Cladr {

export interface GeoRegion {
  name: string;
  region: number;
};

export interface RegionsCallback {
  (regions: GeoRegion[]): any;
}

let g_regions_info : GeoRegion[] = [];

export function GetRegions(callback: RegionsCallback): void {
  if (g_regions_info.length > 0) {
    callback(g_regions_info);
    return;
  }

  new Net.Request({
    method: Net.Method.GET,
    url: `http://${GetMatCatLabHost()}/cladr`,
    success_callback: OnRegionsReceived.bind(window, callback),
    failure_callback: OnRegionsFailed.bind(window, callback),
  });
}

function OnRegionsReceived(callback: RegionsCallback,
                           response: {status: number,
                                      content: {cladr: GeoRegion[]}}) {
  g_regions_info = response.content.cladr;
  callback(g_regions_info);
}

function OnRegionsFailed(callback: RegionsCallback, error: Error) {
  callback(undefined);
}

};  // module Cladr

export = Cladr;
