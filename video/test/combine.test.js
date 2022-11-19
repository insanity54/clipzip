
const {
  combineClips,
  getVideoProbe,
  getClipAbsoluteFileName,
  configureEditlyLayer,
  getEditlySpec
} = require('../lib/combine');
const path = require('path');
const expect = require('chai').expect;


const testDirectory = path.join(__dirname, '../data/veibae/2021-02-01_2021-02-28');
const outputDir = path.join(__dirname, '..', 'output');
const outputFileName = path.join(outputDir, 'veibae_2021-02-01_2021-02-28.mp4');

describe('combine', function () {
    it('combines clips together', async function () {
        this.timeout(1000*60*15);
        const filename = await combineClips({ directory: testDirectory, outputFileName });
        expect(filename).to.equal(outputFileName);
    });
    it('should be idempotent-- only combining if not already combined', async function () {
        this.timeout(2000);
        const filename = await combineClips({ directory: testDirectory, outputFileName });
        expect(filename).to.equal(outputFileName);
    })
});