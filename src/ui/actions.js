const defaultCB = () => console.log('function not initialized yet');

// NOTE: should probably replace most of the messaging and state management in this app at some point...

// TEAM LIST REFRESH

let refreshTeamListFunc = defaultCB;

export function initRefreshTeamList (refreshFunc) {
  refreshTeamListFunc = refreshFunc;
}

export function refreshTeamList (sort) {
  return refreshTeamListFunc(sort);
}

// TEAM DETAIL REFRESH

let refreshTeamDetailFunc = defaultCB;

export function initTeamDetailRefresh (refreshFunc) {
  refreshTeamDetailFunc = refreshTeamDetailFunc;
}

export function refreshTeamDetail () {
  // if we are refreshing a detail page we can assume that the team list has been loaded
  refreshTeamList(); 
  return refreshTeamDetailFunc();
}