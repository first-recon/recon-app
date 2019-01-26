import GenericModel from './generic';
const { csvDelimiter } = require('../../../config');

export default function Team (t) {
  GenericModel.call(this);

  this.data = {
    id: t.id,
    name: t.name,
    number: t.number,
    matches: t.matches,
    notes: t.notes || '',
    isTop: false,
    stats: {
      total: 0,
      auto: 0,
      teleop: 0,
      endgame: 0
    },
    timesDead: 0
  };

  this.getCSVHeaders = () => {
    return Object.keys(this.data).join(csvDelimiter);
  };

  Team.csvExclusions = [
    'matches',
    'notes',
    'isTop',
    'stats',
    'timesDead'
  ];

  this.toCSV = () => {
    function getData (team) {
      return Object.keys(team)
        .filter(k => !Team.csvExclusions.find(ek => ek === k))
        .map((key) => {
          const value = team[key];
          return `${value}`;
        });
    }

    return getData(this.data).join(csvDelimiter);
  };
}
