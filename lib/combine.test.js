
const {
  combineClips,
  getVideoProbe,
  getClipAbsoluteFileName,
  configureEditlyLayer,
  getEditlySpec
} = require('./combine');
const path = require('path');

const testDirectory = path.join(__dirname, '../data/ironmouse/2021-03-01_2021-03-31');

describe('combine', function () {
    this.timeout(1000*60*15);
    it('combines clips together', async function () {
        await combineClips({ directory: testDirectory });
    });
})