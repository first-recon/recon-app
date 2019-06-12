import makeListener from './make-listener';

export default function Service () {}

listeners = [];

Service.prototype.getEventId = function () {
    throw new Error('you need to return an event id!!');
}

Service.prototype.addListener = function (that, method, cb) {
    const newListener = makeListener(that.getEventId(), method, cb);
    listeners.push(newListener);
    return newListener.id;
};

Service.removeListener = function (id) {
    const initialLength = listeners.length;
    listeners = listeners.filter(l => l.id !== id);
    return initialLength > listeners.length; // returns true if listener removed
};

Service.registerEvent = function (eventName, func) {
    return function (...args) {
        const eventId = this.getEventId();
        return func.apply(this, args)
            .then(retVal => {
                const ls = listeners.filter(({ namespace, method }) => eventId === namespace && method === eventName);
                ls.forEach(({ callback }) => callback(retVal));
                return retVal;
            });
    };
};