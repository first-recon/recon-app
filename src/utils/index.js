// i hate JS
export function deepClone (object) {
  return JSON.parse(JSON.stringify(object));
}

let teamCounter = 0;

export function createTeam (number, isTop, matches, timesDead, avgScores) {
  return {
    id: Date.now(),
    name: `Team ${teamCounter++}`,
    number: number || `${Math.round(Math.random() * 20000)}`,
    isTop: isTop || Math.random() % 2 === 0,
    matches: matches || [],
    timesDead: timesDead || 0,
    stats: avgScores || {
      auto: 0,
      teleop: 0,
      endgame: 0,
      total: 0
    }
  };
}

/**
 * Extension to Promise library that resolves promises in order. Does not pass thru result values!
 * @param {array} promises an array of promises
 * @param {array} results resolved values of promises
 */
Promise.seq = function (promises, results=[]) {
  if (promises.length === 0) {
    return Promise.resolve(results);
  }

  return promises[0]()
    .then((value) => {
      const nextResults = results;
      nextResults.push(value);
      return Promise.seq(promises.slice(1), nextResults);
    });
};

// cb will be called with (resolve, reject) as arguments.
// You MUST call resolve in order to make this work :))))
Promise.make = function (cb) {
  return () => new Promise(cb);
};