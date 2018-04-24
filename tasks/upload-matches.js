import MatchService from '../src/services/match-service';

const config = require('../config');

const matchService = new MatchService();

export default function uploadMatches() {
    console.log('Beginning local match scan...');
    matchService.getAll()
        .then(ms => ms.filter(m => !m.uploaded))
        .then((localMatches) => {
            console.log(`Found ${localMatches.length} to push to server...`);            
            return Promise.all(localMatches.map((local) => {
                fetch(config.apis.match.url, {
                    method: 'POST',
                    body: JSON.stringify({
                        id: local.id,
                        team: local.team,
                        matchId: local.matchId,
                        timeStamp: local.id, // TODO: save this timestamp at creation
                        alliance: local.alliance,
                        data: JSON.stringify(local.data)
                    }),
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    }
                  })
                  .then(response => {
                    if (response.status === 200) {
                      matchService.update(local.id, Object.assign({}, local, { uploaded: true }));
                    }
                  })
                  .catch((error) => {
                    console.log(local.id, error);
                  });
            }));
        })
        .then(() => console.log('Finished uploading matches.'));
}