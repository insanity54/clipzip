
class LessThanTenClips extends Error {
    constructor(message) {
        super(message);
        this.name = 'LessThanTenClips';
        this.code = 'LTTENCLIPS';
    }
}

class ChannelNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'ChannelNotFound';
        this.code = 'CHANNELNOTFOUND';
    }
}

module.exports = {
    LessThanTenClips,
    ChannelNotFound
}