export function genQRCode (data, QRCode, type) {
  return new Promise((resolve, reject) => {
    QRCode.toString(type + data, { type: 'svg', errorCorrectionLevel: type === 'T' ? 'L' : 'H' }, (err, url) => {
      !err ? resolve(url) : reject(err);
    });
  });
}

export function unpackQRCode (qrString) {
  return qrString;
}

export function mapCSVToTeam (fields) {
  return {
    id: Number(fields[0]),
    name: fields[1],
    number: fields[2]
  };
}

export function mapCSVToMatch (fields) {
  return {
    id: fields[0],
    team: fields[1],
    tournament: Number(fields[2]),
    number: Number(fields[3]),
    matchId: fields[4],
    alliance: fields[5],
    comments: fields[6],
    uploaded: Boolean(fields[7]),
    game: fields[8],
    timestamp: fields[9],
    data: JSON.parse(fields[10]),
    isFinal: Boolean(fields[11])
  };
}