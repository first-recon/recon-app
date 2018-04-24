import GenericModel from './generic';
const gameConfig = require('../../data/game-config'); // TODO: dep inject this
const { csvDelimiter } = require('../../../config');

function Match (m, config=gameConfig) {
  GenericModel.call(this);

  this.data = {
    team: typeof m.team === 'object' ? m.team.number : m.team,
    tournament: typeof m.tournament === 'object' ? m.tournament.id : m.tournament,
    number: m.number,
    matchId: m.matchId,
    alliance: m.alliance,
    comments: m.comments,
    uploaded: m.uploaded || false,
    data: {
      rules: gameConfig.rules.map((rule, i) => {
        const matchRule = m.data.rules.find((ruleMData) => ruleMData.name === rule.name);
        return {
          name: matchRule.name,
          points: matchRule.points || 0
        };
      })
    }
  };

  this.toCSV = () => {

    function getData (match) {
      return Object.keys(match).map((key) => {
        const value = match[key];
        if (key === 'data') {
          const t = match.data.rules.join(csvDelimiter);
          return t;
        } else if (key === 'comments') {
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
  data: gameConfig
};

Match.getCSVHeaders = () => {

  function getHeaders (match) {
    return Object.keys(match).map((key) => {
      const childKey = Object.keys(match[key]);
      if (key === 'data') {
        return match.data.rules.join(csvDelimiter);
      } else {
        return key;
      }
    });
  }

  return getHeaders(Match.schema).join(csvDelimiter);
};

export default Match;