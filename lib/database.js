
const knexConfig = require('../knexfile')[process.env.NODE_ENV === 'production' ? 'production' : 'development'];
const knex = require('knex')(knexConfig);
const Promise = require('bluebird');

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}


const vtuberCols = ['id', 'channel', 'dom', 'strikes', 'blacklisted', 'note', 'createdAt', 'updatedAt'];

const logOutput = (output) => {
    console.log(JSON.stringify(output, 0, 2));
}

class Database {
    constructor() {
        return this;
    }

    handleCli(argv) {
        return new Promise((resolve, reject) => {
            if (argv.add) reject('there is no --add sub-command! I think you mean --create.')
            if (argv.init) resolve(this.init());
            else if (argv.create) resolve(this.create(argv.channel, argv.dom, argv.strikes, argv.blacklisted, argv.note));
            else if (argv.read)   resolve(this.read  (argv.id, argv.channel, argv.dom, argv.strikes, argv.blacklisted));
            else if (argv.update) resolve(this.update(argv.id, argv.channel, argv.dom, argv.strikes, argv.blacklisted, argv.note));
            else if (argv.delete) resolve(this.delete(argv.id));
        }).then((output) => {
            logOutput(output);
            knex.destroy();
        })
    }

    async init() {
        const tableExists = await knex.schema.hasTable('vtubers');
        if (!tableExists) {
            console.log(`  [*] creating vtubers table.`);
            await knex.schema
                .createTable('vtubers', (table) => {
                    table.increments();
                    table.string('channel');
                    table.unique('channel');
                    table.integer('strikes').defaultTo(0);
                    table.boolean('blacklisted').defaultTo(false);
                    table.date('createdAt').defaultTo(new Date());
                    table.date('updatedAt').defaultTo(new Date());
                    table.integer('dom');
                    table.text('note');
                })
                .catch((e) => {
                    console.error(e);
                })
                .then(() => {
                    knex.destroy();
                })
        } else {
            console.log(`  [*] database already exists.`)
        }
        console.log('init complete.')
        await knex.destroy();
    }

    async create(channel, dom, strikes, blacklisted, note) {
        if (typeof channel === 'undefined') throw new Error('--create command requires at least --channel (-c)')
        const daysQuery = knex
            .select('dom')
            .from('vtubers')
            .whereNot({
                blacklisted: true,
                strikes: 3
            })
            .then((cols) => {

                // create a object to track the count vtubers scheduled for a day
                // we are using this to find a day which is most empty
                let days = [];
                for (let i=1; i<29; i++) {
                    days.push({ day: i, count: 0 });
                }

                // populate the counts using
                // the column data
                for (let i=0; i<cols.length; i++) {
                    const idx = days.findIndex((d) => d.day === cols[i].dom);
                    days[idx].count += 1;
                }

                // sort by ascending count of days least scheduled 
                // to days most scheduled
                days.sort((a, b) => (a.count - b.count));


                // pick the day least scheduled
                const selectedDay = days[0].day;
                return selectedDay;
            })
        
        const insertion = (day) => {
            return knex
                .into('vtubers')
                .insert({
                    channel: channel,
                    dom: (typeof dom === "undefined") ? day : dom,
                    strikes: strikes || 0,
                    blacklisted: blacklisted || false,
                    note: note || ""
                })
                .returning(vtuberCols)

        }


        return daysQuery
            .then(insertion);

    }


    async read(id, channel, dom, strikes, blacklisted) {
        return knex
            .select('*')
            .from('vtubers')
            .where((builder) => {
                if (id) builder.where('id', id);
                if (channel) builder.where('channel', channel);
                if (dom) builder.where('dom', dom);
                if (strikes) builder.where('strikes', strikes);
                if (blacklisted) builder.where('blacklisted', blacklisted);
            })
    }

    async update(id, channel, dom, strikes, blacklisted, note) {
        if (typeof id === 'undefined') throw new Error('--id is required for the update sub-command');
        return knex
            .returning(vtuberCols)
            .from('vtubers')
            .where({
                id: id
            })
            .update({
                channel: channel,
                dom: dom,
                strikes: strikes,
                blacklisted: blacklisted,
                note: note,
                updatedAt: Date()
            })
            .then((row) => {
                console.log(row);
            })
    }

    async delete(id) {
        if (typeof id === 'undefined') throw new Error('--id is required for delete sub-command');
        return knex
            .select('*')
            .from('vtubers')
            .where('id', id)
            .del()
    }



}

module.exports = Database;