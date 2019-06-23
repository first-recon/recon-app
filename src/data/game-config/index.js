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

module.exports = {
    getRuleset,
    getRuleAttribute,
    getRulesetObj,
    getRulesForPeriod
};