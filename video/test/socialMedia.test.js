
const expect = require('chai').expect;
const { getYouTubeChannelName, getVtuberData, isYtChannelLink } = require('../lib/socialMedia');


describe('socialMedia', function () {

    describe('isYtChannelLink', function () {
      it('should return false for a youtube video link', function () {
        const link = 'https://www.youtube.com/watch?v=Qr2sLOpI4sM&t'
        expect(isYtChannelLink(link)).to.be.false
      })
      it('should return true for a youtube channel link', function () {
        const link = 'https://www.youtube.com/channel/UCqw6HO7MxMO1leFMDi51w7A'
        expect(isYtChannelLink(link)).to.be.true
      })
    })

    describe('getYouTubeChannelName', function () {
        this.timeout(30*1000);

        it('should get a channel name when given a /channel/<MACHINE_ID> URL ', async function () {
            const name = await getYouTubeChannelName('https://www.youtube.com/channel/UC1yoRdFoFJaCY-AGfD9W0wQ')
            expect(name).to.equal('Projekt Melody')
        })
        it('should get a channel name when given a /c/<HUMAN_READABLE_ID> URL', async function () {
            const name = await getYouTubeChannelName('https://www.youtube.com/c/ApricottheLichTwitchArchive')
            expect(name).to.equal('Apricot the Lich Twitch Archive');
        })
    })


  describe('getVtuberData', function () {

    it('getVtuberData ironmouse', async function () {
      this.timeout(1000*60*2)
       
      const data = await getVtuberData('ironmouse', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('ironmouse');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData silvervale', async function () {
      this.timeout(1000*60*2)
       
      const data = await getVtuberData('silvervale', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('Silvervale');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData kuzuryuio', async function () {
      this.timeout(1000*60*2)
       
      const data = await getVtuberData('kuzuryuio', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('KuzuryuIo');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData konbanmiao', async function () {
      this.timeout(1000*60*2)
      const data = await getVtuberData('konbanmiao', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('konbanmiao');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData apricot', async function () {
      this.timeout(1000*60*2)
      const data = await getVtuberData('apricot', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('Apricot');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
    it('getVtuberData zentreya', async function () {
      this.timeout(1000*60*2)
       
      const data = await getVtuberData('zentreya', true);
      expect(data).to.have.property('socialMediaLinks');
      expect(data).to.have.property('displayName');
      expect(data.displayName).to.equal('Zentreya');
      expect(data.socialMediaLinks).to.have.lengthOf.above(0);
      expect(data.socialMediaLinks[0]).to.be.a('string');
      setTimeout(() => { return }, 2000)
    })
  })

});