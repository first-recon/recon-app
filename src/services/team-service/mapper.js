const deadSynonyms = require('./dead-synonyms');

function getScores (match) {

  // GRIPE: it's not terrible to hardcode the categories, but it's not great either.
  // going with ok here because this is used for display purposes only, so if it doesn't work... oh well
  const scores = {
    autonomous: match.data.rules.filter(r => r.period === 'autonomous').reduce((t, r) => t + r.points, 0),
    teleop: match.data.rules.filter(r => r.period === 'teleop').reduce((t, r) => t + r.points, 0),
    endGame: match.data.rules.filter(r => r.period === 'endgame').reduce((t, r) => t + r.points, 0)
  };

  scores.total = scores.autonomous + scores.teleop + scores.endGame;
  return scores;
}

export function format (team) {
  let numOfDead = 0;
  const scores = team.matches.map((match)=> {
    const didDie = !!deadSynonyms.find((ds) => match.comments.toLowerCase().includes(ds));
    if (didDie) {
      numOfDead++;
    }
    return getScores(match);
  });
  const avgScores = scores.reduce((runningAvgScores, currentScores) => {
    return {
      autonomous: (runningAvgScores.autonomous + currentScores.autonomous) / 2,
      teleop: (runningAvgScores.teleop + currentScores.teleop) / 2,
      endGame: (runningAvgScores.endGame + currentScores.endGame) / 2,
      total: (runningAvgScores.total + currentScores.total) / 2,
    };
  }, { autonomous: 0, teleop: 0, endGame: 0, total: 0 });

  return {
    id: team.id,
    name: team.name,
    number: team.number,
    matches: team.matches,
    notes: team.notes,
    isTop: avgScores.total > 120,
    averageScores: avgScores,
    timesDead: numOfDead
  };
}