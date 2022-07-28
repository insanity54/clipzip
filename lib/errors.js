
class LessThanTenClips extends Error {
    constructor(message) {
        super(message);
        this.name = 'LessThanTenClips';
        this.code = 'LTTENCLIPS';
    }
}

module.exports = {
    LessThanTenClips
}