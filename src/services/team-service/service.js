import Service from '../service';
import DbClient from '../../db/client'

const parseMatch = m => ({
  ...m,
  data: JSON.parse(m.data),
  scores: JSON.parse(m.scores),
});

const parseTeam = team => (team && {
  ...team,
  matches: team.matches.map(parseMatch)
});

const calculateAvgTotal = matches => matches.reduce((t, m) => m.scores.stats.total + t, 0) / matches.length;
const calculateAvgAuto = matches => matches.reduce((t, m) => m.scores.stats.autonomous.total + t, 0) / matches.length;
const calculateAvgTeleop = matches => matches.reduce((t, m) => m.scores.stats.teleop.total + t, 0) / matches.length;
const calculateAvgEndgame = matches => matches.reduce((t, m) => m.scores.stats.endgame.total + t, 0) / matches.length;

const calculateStats = team => (team && {
  ...team,
  stats: {
    total: calculateAvgTotal(team.matches),
    auto: calculateAvgAuto(team.matches),
    teleop: calculateAvgTeleop(team.matches),
    endgame: calculateAvgEndgame(team.matches)
  }
});

const processTeamResults = teams =>
  teams
    .map(parseTeam)
    .map(calculateStats);

function TeamService (teamDataDir) {
  const database = new DbClient();
  this.teams = database.teamCollection;
}

TeamService.prototype = Object.create(Service.prototype);

TeamService.prototype.getAll = function () {
  return this.teams.getAll()
    .then(processTeamResults);
};

// get a team by number
TeamService.prototype.getByNumber = function (number) {
  return this.teams.find((team) => team.number === number)
    .then(parseTeam)
    .then(calculateStats);
};

TeamService.prototype.get = function (params) {
  return this.teams.filter(params).then(processTeamResults);
};

TeamService.prototype.create = Service.registerEvent('create', function (team) {
  return this.getByNumber(team.number)
    .then((foundTeam) => {

      // FIXME: should be in the db/client file
      return foundTeam ?
        Promise.reject({ name: 'DbAddOpError', message: 'A team with that number already exists.' })
        : this.teams.add(team);
    });
});

TeamService.prototype.update = Service.registerEvent('update', function (number, newTeamData) {
  return this.getByNumber(number)
    .then((team) => this.teams.update(team.id, newTeamData));
});

TeamService.prototype.delete = Service.registerEvent('delete', function (number) {
  return this.getByNumber(number)
    .then((team) => this.teams.remove(team.id));
});

TeamService.prototype.deleteAll = function () {
  return this.teams.clear();
};

TeamService.prototype.getEventId = function () {
  return 'team-service';
};

TeamService.prototype.addListener = function (method, cb) {
  return Service.prototype.addListener(this, method, cb);
};

export default TeamService;
