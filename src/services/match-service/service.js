import Service from '../service';
import DbClient from '../../db/client';
import { GameConfig } from '../../../recon-lib';

function MatchService () {
  const database = new DbClient();
  this.matches = database.matchCollection;
}

MatchService.prototype = Object.create(Service.prototype);

MatchService.prototype.getAll = function (hydrateResults=true) {
  return this.matches.getAll(hydrateResults)
    .then(res => res.map(m => ({
      ...m,
      data: JSON.parse(m.data),
      scores: JSON.parse(m.scores)
    })));
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

      return matches
        .map(m => ({
          ...m,
          data: JSON.parse(m.data),
          scores: JSON.parse(m.scores)
        }));
    });
};

MatchService.prototype.create = Service.registerEvent('create', function (match) {
  return this.matches.add({
    ...match,
    data: JSON.stringify(match.data),
    scores: JSON.stringify(GameConfig.calcScoresFromData(match.data))
  });
});

MatchService.prototype.update = function (id, match) {
  return this.matches.update(id, {
    ...match,
    data: JSON.stringify(match.data),
    scores: JSON.stringify(GameConfig.calcScoresFromData(match.data))
  })
  .then(updated => ({
    ...updated,
    data: JSON.parse(updated.data),
    scores: JSON.parse(updated.scores)
  }));
};

MatchService.prototype.delete = function (id) {
  return this.matches.remove(id);
};

MatchService.prototype.deleteAll = function () {
  return this.matches.clear();
};

MatchService.prototype.getEventId = function () {
  return 'match-service';
};

MatchService.prototype.addListener = function (method, cb) {
  return Service.prototype.addListener(this, method, cb);
};

export default MatchService;
