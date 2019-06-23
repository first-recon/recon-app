import GenericModel from './generic';
import * as Validators from './validators';
const { csvDelimiter } = require('../../../config');
import config from '../../../config';

// const VALIDATE_MATCH_ID = /^\d+\-([D].[a-zA-Z]+\-)?([FQ])\-(\d+|[(QF)(SF)(FI)]{2}\d+.\d+)\-[RB]\-\d+$/;
const VALIDATE_MATCH_ID = /^\d+\-([D].[a-zA-Z]+\-)?([FQ])\-(\d+|[(QF)(SF)(FI)]{2}\d+.\d+)/;
const VALIDATE_FULL_ID = /^\d+\-([D].[a-zA-Z]+\-)?([FQ])\-(\d+|[(QF)(SF)(FI)]{2}\d+.\d+)\-([BR])\-\d+$/;

function validateMatch ({
  id,
  team,
  tournament,
  number,
  matchId,
  alliance,
  comments,
  uploaded,
  data,
  scores,
  type,
  division,
  level,
  levelNum,
  timestamp
}) {

  Validators.shouldNotBeUndefinedOrNull('tournament', tournament);
  Validators.shouldBeNumber('tournament', tournament);

  Validators.shouldExist('number', number);
  Validators.shouldBeNumber('number', number);

  Validators.shouldExist('team', team);

  Validators.shouldExist('matchId', matchId);
  Validators.shouldMatch('matchId', matchId, VALIDATE_MATCH_ID);

  Validators.shouldExist('alliance', alliance);
  Validators.shouldBeString('alliance', alliance);

  Validators.shouldExist('data', data);
  Validators.shouldBeString('data', data);
  Validators.shouldParseAsJson('data', data);

  Validators.shouldExist('scores', scores);
  Validators.shouldBeString('scores', scores);
  Validators.shouldParseAsJson('scores', scores);

  Validators.shouldNotBeUndefinedOrNull('comments', comments);
  Validators.shouldBeString('comments', comments);

  Validators.shouldBeBoolean('uploaded', uploaded);

  Validators.shouldExist('id', id);
  Validators.shouldBeString('id', id);
  Validators.shouldMatch('id', id, VALIDATE_FULL_ID);

  Validators.shouldBeAnyOf('type', type, ['FINAL', 'QUAL']);

  Validators.shouldNotBeUndefined('divison', division);
  console.log('DIVISION', division);
  if (typeof division === 'string') {
    Validators.shouldBeString('division', division);
    Validators.shouldHaveLength('division', division);
  }

  Validators.shouldBeAnyOf('level', level, ['QF', 'SF', 'FI', null]);
  Validators.shouldBeNumber('levelNum', levelNum);

  Validators.shouldExist('timestamp', timestamp);
  Validators.shouldBeNumber('timestamp', timestamp);
}

// m.level is QF, SF or FI, quarterfinal, semifinal, or final
// m.levelNum is the elim set number (semifinal 1, semifinal 2, etc..)
// 456789-EDISON-QF1-M2
function buildUniqueMatchIdentifier (m) {

  const idArray = [];

  idArray.push(buildMatchId(m));

  idArray.push(m.alliance.charAt(0));

  idArray.push(m.team);

  return idArray.join('-');
}

function buildMatchId ({ tournament, division, type, level, levelNum, number }) {

  const matchIdArray = [tournament];

  // match id
  if (division) {
    matchIdArray.push('D.' + division);
  }

  matchIdArray.push(type.charAt(0));

  matchIdArray.push(type === 'FINAL' ? `${level}${levelNum}.${number}` : number); // 45 for qual or SF2.2 for final

  return matchIdArray.join('-');
}

function Match (m) {
  GenericModel.call(this);

  const teamNum = typeof m.team === 'object' ? m.team.number : m.team;
  const tournamentId = typeof m.tournament === 'object' ? m.tournament.id : m.tournament;

  this.data = {
    id: buildUniqueMatchIdentifier(m),
    team: m.team,
    tournament: m.tournament,
    number: m.number,
    matchId: buildMatchId(m),
    alliance: m.alliance,
    comments: m.comments,
    uploaded: m.uploaded || false,
    game: config.game,
    timestamp: m.timestamp || Date.now(),
    data: m.data,
    scores: m.scores,
    type: m.type,
    division: m.division,
    level: m.level,
    levelNum: m.levelNum
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

Match.csvExclusions = [
  'scores',
  'type',
  'matchId',
  'tournament',
  'team',
  'number',
  'alliance',
  'divison'
];

export default Match;