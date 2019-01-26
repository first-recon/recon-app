export default function makeListener (namespace, method, callback) {
    return {
        id: `${namespace}.${method}.${Date.now()}`,
        namespace,
        method,
        callback
    }
}