const Daemon = require('./daemon');
const { DateTime } = require('luxon');



describe('daemon', () => {
    describe('getDates', () => {
        let daemon;
        test('getDates', () => {
            const testData = [
                { inputDate: '2021-01-01', expectedStartDate: '2020-11-01', expectedEndDate: '2020-11-30' },
                { inputDate: '2021-02-01', expectedStartDate: '2020-12-01', expectedEndDate: '2020-12-31' },
                { inputDate: '2021-03-01', expectedStartDate: '2021-01-01', expectedEndDate: '2021-01-31' },
                { inputDate: '2021-04-01', expectedStartDate: '2021-02-01', expectedEndDate: '2021-02-28' },
                { inputDate: '2021-05-01', expectedStartDate: '2021-03-01', expectedEndDate: '2021-03-31' },
                { inputDate: '2021-06-01', expectedStartDate: '2021-04-01', expectedEndDate: '2021-04-30' },
                { inputDate: '2021-07-01', expectedStartDate: '2021-05-01', expectedEndDate: '2021-05-31' },
                { inputDate: '2021-08-01', expectedStartDate: '2021-06-01', expectedEndDate: '2021-06-30' },
                { inputDate: '2021-09-01', expectedStartDate: '2021-07-01', expectedEndDate: '2021-07-31' },
                { inputDate: '2021-10-01', expectedStartDate: '2021-08-01', expectedEndDate: '2021-08-31' },
                { inputDate: '2021-11-01', expectedStartDate: '2021-09-01', expectedEndDate: '2021-09-30' },
                { inputDate: '2021-12-01', expectedStartDate: '2021-10-01', expectedEndDate: '2021-10-31' }
            ];
            for (testDatum of testData) {
                const { inputDate, expectedEndDate, expectedStartDate } = testDatum;
                const { endDate, startDate } = daemon.getDates(inputDate);
                expect(startDate).toBe(expectedStartDate);
                expect(endDate).toBe(expectedEndDate);
            }
        }); 
    })
})