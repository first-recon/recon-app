const gameConfig = require('../../data/game-config');

// TODO: create a canonical model structure
export function empty (team) {
  return {
    team: team,
    tournament: 0,
    number: 1,
    matchId: '',
    alliance: 'RED',
    comments: '',
    uploaded: false,
    data: {
      categories: gameConfig.categories.map((category) => {

        // merge points for current match with rule metadata
        category.rules = category.rules.map((rule, i) => {
          rule.points = 0;
          return rule;
        });

        return category;
      })
    }
  }
}