"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFound = exports.BadRequest = void 0;
class BadRequest extends Error {
    constructor(message) {
        super(message);
        this.name = 'BadRequest';
    }
}
exports.BadRequest = BadRequest;
class NotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFound';
    }
}
exports.NotFound = NotFound;
