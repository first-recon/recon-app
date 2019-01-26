import GenericModel from './generic';
import * as Validators from './validators';
const { csvDelimiter } = require('../../../config');
import config from '../../../config';

function validateMatch ({
  team,
  tournament,
  number,
  matchId,
  alliance,
  comments,
  uploaded,
  data,
  scores
}) {

  Validators.shouldNotBeUndefinedOrNull('tournament', tournament);
  Validators.shouldNotBeUndefinedOrNull('number', number);

  Validators.shouldExist('team', team);
  Validators.shouldExist('matchId', matchId);
  Validators.shouldExist('alliance', alliance);
  Validators.shouldExist('data', data);
  Validators.shouldExist('scores', scores);

  Validators.shouldBeString('comments', comments);

  Validators.shouldBeBoolean('uploaded', uploaded);

  Validators.shouldMatch('matchId', matchId, /\d+\-\d+/g);

  Validators.shouldParseAsJson('data', data);
  Validators.shouldParseAsJson('scores', scores);

}

function Match (m) {
  GenericModel.call(this);

  const teamNum = typeof m.team === 'object' ? m.team.number : m.team;
  const tournamentId = typeof m.tournament === 'object' ? m.tournament.id : m.tournament;

  this.data = {
    id: m.id || Date.now(),
    team: teamNum,
    tournament: tournamentId,
    number: m.number,
    matchId: `${tournamentId}-${m.number}`,
    alliance: m.alliance,
    comments: m.comments,
    uploaded: m.uploaded || false,
    game: config.game,
    timestamp: Date.now(),
    data: m.data,
    scores: m.scores
  };

  validateMatch(this.data);

  this.toCSV = () => {
    function getData (match) {
      return Object.keys(match)
        .filter(k => !Match.csvExclusions.find(ek => ek === k))
        .map((key) => {
          const value = match[key];
          if (key === 'comments') {
            return value;
          } else {
            return value;
          }
        });
    }

    return getData(this.data).join(csvDelimiter);
  };
}

Match.schema = {
  team: '',
  tournament: 0,
  number: 0,
  matchId: '',
  alliance: '',
  comments: '',
  data: '',
  scores: ''
};

Match.csvExclusions = [
  'scores'
];

Match.getCSVHeaders = () => {
  function getHeaders (match) {
    return Object.keys(match)
      .map((key) => {
        if (key === 'data') {
          return Object.keys(match.data).map(r => r.name).join(csvDelimiter);
        } else {
          return key;
        }
      });
  }

  return getHeaders(Match.schema).join(csvDelimiter);
};

export default Match;