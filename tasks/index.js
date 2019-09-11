import uploadMatches from './upload-matches';
import downloadEvents from './download-events';
const config = require('../config');

export default function scheduleTasks () {
    console.log('Scheduling tasks...');
    setInterval(() => uploadMatches(), config.scheduledTasks.matchUpload.interval);
    setInterval(() => downloadEvents(), config.scheduledTasks.eventLoading.interval);
}