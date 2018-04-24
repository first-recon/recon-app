const gameConfig = require('../../../data/game-config');

export function genQRCode (csvMatchString, QRCode) {
  return new Promise((resolve, reject) => {
    QRCode.toString(csvMatchString, { type: 'svg' }, (err, url) => {
      !err ? resolve(url) : reject(err);
    });
  });
}

export function createTeam (fields) {
  return {
    id: Number(fields[0]),
    name: fields[1],
    number: fields[2]
  };
}

export function createMatch (fields) {
  console.log(fields);
  return {
    team: fields[0],
    tournament: Number(fields[1]),
    number: Number(fields[2]),
    matchId: fields[3],
    alliance: fields[4],
    comments: fields[5],
    uploaded: fields[6],
    data: {
      rules: gameConfig.rules.map((r, i) => {
        const fieldIdx = 7 + i;
        return Object.assign({}, r, { points: Number(fields[fieldIdx]) });
      })
    }
  };
}