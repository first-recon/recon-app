import DbClient from '../../db/client';
import { empty } from './mapper';

const config = require('../../../config');

function MatchService () {
  const database = new DbClient();
  this.matches = database.matchCollection;
  this.getEmptyMatch = empty;
}

MatchService.prototype.getAll = function () {
  return this.matches.getAll();
};

MatchService.prototype.get = function (params) {
  return this.matches.filter(params)
    .then((matches) => {
      matches.sort((a, b) => {
        const tDiff = a.tournament.id - b.tournament.id;
        if (tDiff === 0) {
          return a.number - b.number;
        }
        return tDiff;
      });
      return matches;
    });
};

// TODO: consider reworking this horrible CRUD system
MatchService.prototype.create = function (match) {
  return this.matches.add(match)
    .then((added) => {
      const matchToUpload = {
        id: added.id,
        team: added.team,
        matchId: added.matchId,
        timeStamp: Date.now(), // TODO: save this timestamp at creation
        alliance: added.alliance,
        data: JSON.stringify(added.data)
      };
      fetch(config.apis.match.url, {
        method: 'POST',
        body: JSON.stringify(matchToUpload),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.status === 200) {
          this.matches.update(added.id, Object.assign({}, added, { uploaded: true }));
        }
      })
      .catch((error) => {
        console.log(error);
      });
    });
};

MatchService.prototype.update = function (id, newMatchData) {
  return this.matches.update(id, newMatchData);
};

MatchService.prototype.delete = function (id) {
  return this.matches.remove(id);
};

export default MatchService;
