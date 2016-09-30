import {Request} from "./net";

module HistoryState {
export interface State {
  name: string;
  value: string;
};
export function GetStates(): State[] {
  const queries = document.location.search.slice(1).split('&');
  let states: State[] = [];
  queries.forEach(query => {
    const query_pair = query.split("=");
    if (query_pair.length == 2) {
      states.push({
        name : query_pair[0],
        value: query_pair[1]
      });
    }
  });
  return states;
}
export function GetStateValue(name: string,
                              default_value: string = ""): string {
  const states = GetStates();
  let value = default_value;
  states.forEach(state => {
    if (state.name == name) {
      value = state.value;
    }
  });
  return value;
}

export function MakeStateUrl(dict: {[key: string]: any}): string {
  return "?" + Request.MakeQuery(dict);
}

export function UpdateState(data: any,
                            title: string,
                            dict: {[key: string]: any},
                            should_replace: boolean = false): void {
  const states = GetStates();
  let new_states: {[key: string]: any} = {};
  states.forEach(state => new_states[state.name] = state.value);
  for (const key in dict) {
    if (dict[key])
      new_states[key] = dict[key];
    else
      delete new_states[key];
  }
  if (should_replace) {
    history.replaceState(data, title, MakeStateUrl(new_states));
  } else {
    history.pushState(data, title, MakeStateUrl(new_states));
  }
}

};  // module HistoryState

export = HistoryState;
