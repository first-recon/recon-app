import MatchService from '../src/services/match-service';

const config = require('../config');

const matchService = new MatchService();

export default function uploadMatches() {
    console.log('Beginning local match scan...');
    matchService.getAll(false)
        .then((ms) => {
          return ms.filter(m => !m.uploaded);
        })
        .then((localMatches) => {
            console.log(`Found ${localMatches.length} to push to server...`);          
            return Promise.all(localMatches.map((local) => {
                fetch(config.apis.match.url, {
                    method: 'POST',
                    body: JSON.stringify({
                        id: `${local.team}-${local.tournament}-${local.number}`,
                        team: local.team,
                        tournament: local.tournament,
                        matchId: local.matchId,
                        timeStamp: local.id, // TODO: save this timestamp at creation
                        alliance: local.alliance,
                        number: local.number,
                        data: JSON.stringify(local.data)
                    }),
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    }
                  })
                  .then(res => res.json())
                  .then(data => {
                    if (data.success) {
                      return matchService.update(local.id, Object.assign({}, local, { uploaded: true }));
                    }
                    return Promise.resolve();
                  })
                  .catch((error) => console.error(local.id, error));
            }));
        })
        .then(() => console.log('Finished uploading matches.'));
}