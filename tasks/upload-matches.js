import MatchService from "../src/services/match-service";

const config = require("../config");

const matchService = new MatchService();

export default function uploadMatches() {
  console.log('Beginning local match scan...');
  matchService
    .getAll(false)
    .then(ms => ms.filter(m => !m.uploaded))
    .then(localMatches => {
      console.log(`Found ${localMatches.length} to push to server...`);
      return Promise.all(
        localMatches.map(local => {
          fetch(config.apis.match.url, {
            method: 'POST',
            body: JSON.stringify({
              id: local.id,
              team: local.team,
              tournament: local.tournament,
              matchId: local.matchId,
              timeStamp: local.timestamp,
              alliance: local.alliance,
              number: local.number,
              data: JSON.stringify(local.data)
            }),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })
            .catch()
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                return matchService.update(local.id, {
                  ...local,
                  uploaded: true
                });
              }

              return Promise.reject('data.success !== true');
            })
            .catch(error => {
              console.log('Failed to push to server.');
              console.log('ERROR:', local.id, error);
            });
        })
      );
    })
    .then(() => console.log(`Will rescan in ${config.scheduledTasks.matchUpload.interval / 1000} seconds`));
}
