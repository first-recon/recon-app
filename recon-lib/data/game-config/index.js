const config = require('../config');
const data = require('./rulesets');

const gameRules = data[config.game];

function getRuleset() {
    return Object.freeze(JSON.parse(JSON.stringify(gameRules)));
}

function getRulesForPeriod(period) {
    return getRuleset()
        .filter(rule => period ? rule.period === period : true);
}

function getRuleAttribute(code, attr) {
    return getRuleset().find(rule => rule.code === code ? rule : null)[attr];
}

function getRulesetObj() {
    return getRuleset()
        .reduce((acc, rule) => {
            switch (rule.type) {
                case 'number':
                    acc[rule.code] = 0;
                    break;
                case 'boolean':
                    acc[rule.code] = false;
                    break;
            }
            return acc;
        }, {});
}

function calcScoresFromData(data) {
    // grab match data out of the data object we just got from the ui
    const rules = getRulesetObj();
    const ruleset = getRuleset();
    const scores = {};
  
    // TODO: can probably clean this up
    for (r in rules) {
      rules[r] = data[r];
      const { value } = ruleset.find(rl => rl.code === r);
      scores[r] = value * rules[r];
    }
  
    const getTotalFromRules = (period) => {
      return getRulesForPeriod(period)
        .reduce((runningTotal, { code }) => runningTotal + scores[code], 0);
    };
  
    return {
      ...scores,
      stats: {
        total: getTotalFromRules(),
        autonomous: {
          total: getTotalFromRules('autonomous')
        },
        teleop: {
          total: getTotalFromRules('teleop')
        },
        endgame: {
          total: getTotalFromRules('endgame')
        }
      }
    };
  }

module.exports = {
    getRuleset,
    getRuleAttribute,
    getRulesetObj,
    getRulesForPeriod,
    calcScoresFromData
};