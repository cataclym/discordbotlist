export class DBLError<T = any> extends Error {
    constructor(msg: string, public context?: T) {
        super(msg);
    }
}
