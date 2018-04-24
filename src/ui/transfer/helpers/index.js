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
  return {
    team: fields[0],
    tournament: Number(fields[1]),
    number: Number(fields[2]),
    matchId: fields[3],
    alliance: fields[4],
    comments: fields[5],
    data: {
      rules: [
        {
          period: 'autonomous',
          name: 'Alliance-specific Jewel remaining on platform',
          points: Number(fields[6])
        },
        {
          period: 'autonomous',
          name: 'Glyph scored in Cryptobox',
          points: Number(fields[7])
        },
        {
          period: 'autonomous',
          name: 'Glyph bonus for Cryptobox Key column',
          points: Number(fields[8])
        },
        {
          period: 'autonomous',
          name: 'Robot parked in Safe Zone',
          points: Number(fields[9])
        },
        {
          period: 'teleop',
          name: 'Glyph scored in Cryptobox',
          points: Number(fields[10])
        },
        {
          period: 'teleop',
          name: 'Completed row of 3 in Cryptobox',
          points: Number(fields[11])
        },
        {
          period: 'teleop',
          name: 'Completed column of 4 in Cryptobox',
          points: Number(fields[12])
        },
        {
          period: 'teleop',
          name: 'Completed Cipher',
          points: Number(fields[13])
        },
        {
          period: 'endgame',
          name: 'Relic in Recovery Zone #1',
          points: Number(fields[14])
        },
        {
          period: 'endgame',
          name: 'Relic in Recovery Zone #2',
          points: Number(fields[15])
        },
        {
          period: 'endgame',
          name: 'Relic in Recovery Zone #3',
          points: Number(fields[16])
        },
        {
          period: 'endgame',
          name: 'Bonus for keeping Relic upright',
          points: Number(fields[17])
        },
        {
          period: 'endgame',
          name: 'Robot balanced on Balancing Stone',
          points: Number(fields[18])
        }
      ]
    }
  };
}