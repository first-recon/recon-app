import Collection from './collection';

import TeamModel from './models/team';

const gameConfig = require('../data/game-config');

const config = require('../../config');

let instance;

/**
 * Exports an object with fields representing the domain objects.
 * Think of this file sort of as a subsitute for setting up
 * database contraints
 */
function Client () {
  if (!instance) {
    const newMatchCollection = new Collection('matches.json', []);
    const newTeamCollection = new Collection('teams.json', []);
    const tournamentCollection = new Collection('tournaments.json', config.apis.event.url);
    const settingsCollection = new Collection('settings.json', require('../data/settings'));

    instance = {
      matchCollection: setupMatchCollection(newMatchCollection, newTeamCollection, tournamentCollection),
      teamCollection: setupTeamCollection(newTeamCollection, newMatchCollection),
      tournamentCollection: tournamentCollection,
      settingsCollection: settingsCollection
    };
  }

  return instance;
}

// setup methods allow you put some middleware in front of a db request. This
// allows creating constraints on db ops, some of which might create cyclic
// dependency issues otherwise

// TODO: bind setupMethod this to collection and change these override methods to arrow funcs?
function setupTeamCollection (collection, matchCollection) {
  return {

    getAll: (() => {
      return Promise.all([
        collection.getAll(),
        matchCollection.getAll()
      ])
      .then(([teams, matches]) => {
        return teams.map((team) => {
          const teamWithMatches = team;
          teamWithMatches.matches = matches.filter((m) => m.team === team.number);
          return teamWithMatches;
        });
      });
    }).bind(collection),

    getById: collection.getById.bind(collection),

    find: ((findMethod) => {
      return collection.find(findMethod)
        .then((team) => {
          const teamWithMatches = Object.assign({ matches: [] }, team);
          return team ?
            matchCollection.filter((m) => m.team === teamWithMatches.number)
              .then((matches) => Object.assign({ matches }, teamWithMatches))
            : Promise.resolve(null);
        });
    }).bind(collection),

    filter: ((params) => {
      return collection.filter(params)
        .then(teams => {
          return Promise.all(teams.map(team => {
            const teamWithMatches = Object.assign({ matches: [] }, team);
            return matchCollection.filter((m) => m.team === teamWithMatches.number)
                .then((matches) => Object.assign({}, { matches }, teamWithMatches));
          }));
        });
    }).bind(collection),

    add: collection.add.bind(collection),

    update: ((number, data) => {
      return collection.update(number, (new TeamModel(data)).data);
    }).bind(collection),

    // check if team is contained in any matches
    remove: ((teamId) => {
      return collection.find(({ id }) => id === teamId)
        .then(({ number }) => matchCollection.find((match) => match.team === number))
        .then((match) => {
          if (match) {
            return Promise.reject({
              name: 'DbDeleteOpError',
              message: 'This team cannot be deleted because it has match data.'
            });
          }

          return collection.remove(teamId);
        });
    }).bind(collection),

    clear: collection.clear.bind(collection),
    save: collection.save.bind(collection),
    reload: collection.reload.bind(collection)
  };
}

function setupMatchCollection (collection, teamCollection, tournamentCollection) {
  function format (match) {
    return Promise.all([
      tournamentCollection.getById(match.tournament),
      teamCollection.filter({ number: match.team }).then(([team]) => team)
    ])
    .then(([tournament, team]) => {
      return {
        id: match.id,
        team: team,
        tournament: tournament || { id: -1, name: 'Unknown' },
        number: match.number,
  
        // TODO: rename to code
        matchId: match.matchId,
        alliance: match.alliance,
        comments: match.comments,
        uploaded: match.uploaded,
        data: {
          categories: match.data.categories.map((category) => {
  
            // get category with rule metadata from configuration
            const categoryMetadata = gameConfig.categories.find((cat) => cat.name === category.name);
  
            // merge points for current match with rule metadata
            const newRules = category.rules.map((rule, i) => {
              const ruleMetadata = categoryMetadata.rules.find((ruleMData) => ruleMData.name === rule.name);
              return Object.assign({}, rule, ruleMetadata);
            });
  
            return Object.assign({}, category, { rules: newRules });
          })
        }
      };
    })
    .catch((error) => {
      console.log(error);
    });
  }

  return {
    getAll: (() => {
      return collection.getAll()
        .then((matches) => {
          return Promise.all(matches.map(format))
        });
    }).bind(collection),

    getById: collection.getById.bind(collection),
    find: collection.find.bind(collection),

    filter: ((params) => {
      return collection.filter(params).then((matches) => {
        return Promise.all(matches.map(format));
      })
    }).bind(collection),

    add: ((match) => {
      if (match.number < 1) {
        return Promise.reject({
          name: 'DbSchemaError',
          message: 'Match number must be greater than 0.'
        });
      }

      return collection.filter({ team: match.team, matchId: match.matchId })
        .then((matches) => {
          if (matches.length) {
            return Promise.reject({ name: 'DbAddOpError', message: 'Match already exists in database.' });
          }

          return collection.add(Object.assign(match, { matchId: `${match.tournament}-${match.number}` }));
        });
    }).bind(collection),

    update: collection.update.bind(collection),
    remove: collection.remove.bind(collection),
    clear: collection.clear.bind(collection),
    save: collection.save.bind(collection),
    reload: collection.reload.bind(collection)
  };
}

export default Client;
