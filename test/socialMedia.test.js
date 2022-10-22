
const expect = require('chai').expect;
const { getYouTubeChannelName } = require('../lib/socialMedia');


describe('socialMedia', function () {
	describe('getYouTubeChannelName', function () {
		this.timeout(30*1000);

		it('should get a channel name when given a /channel/<MACHINE_ID> URL ', async function () {
    		const name = await getYouTubeChannelName('https://www.youtube.com/channel/UC1yoRdFoFJaCY-AGfD9W0wQ')
    		expect(name).to.equal('Projekt Melody')
		})
		it('should get a channel name when given a /c/<HUMAN_READABLE_ID> URL', async function () {
			const name = await getYouTubeChannelName('https://www.youtube.com/c/ApricottheLichTwitchArchive')
			expect(name).to.equal('ApricottheLichTwitchArchive');
		})
	})

	describe('getVtuberData', function () {
		this.timeout(30*1000);
		it('should get list of URLs that the talent has put on their Twitch about page', async function () {
			
		})
	})

});