import uploadMatches from './upload-matches';
const config = require('../config');

export default function scheduleTasks () {
    console.log('Scheduling tasks...');
    setInterval(() => uploadMatches(), config.scheduledTasks.matchUpload.interval);
}