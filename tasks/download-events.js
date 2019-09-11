import TournamentService from '../src/services/tournament-service';
import PersistenceService from '../src/services/persistence-service';

const NUMBER_OF_MILLISECONDS_IN_ONE_DAY = 86400000;

const config = require('../config').scheduledTasks.eventLoading;
const timeToExpireEventsMs = config.expireEvents * NUMBER_OF_MILLISECONDS_IN_ONE_DAY;

const eventService = new TournamentService();
const persistenceService = new PersistenceService();

export default function downloadEvents() {

    const now = new Date().getTime();

    return persistenceService.get('eventsLastUpdated')
        .then(({ value: lastUpdatedTimestamp }) => {

            const lastUpdatedMillis = new Date(lastUpdatedTimestamp).getTime();
            const timeSinceLastUpdated = now - lastUpdatedMillis;
            const shouldRefreshEvents = timeSinceLastUpdated > timeToExpireEventsMs;

            if (shouldRefreshEvents) {
                console.log('Refreshing events...');
                eventService.reload();
                return persistenceService.update('eventsLastUpdated', new Date().toISOString())
            }

        });

}