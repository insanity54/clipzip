require('dotenv').config();
const execa = require('execa');
const envImport = require('@grimtech/envimport');

const pass = envImport('DB_PASS');
const user = envImport('DB_USER');
const db = envImport('DB_NAME');
const host = envImport('DB_HOST');

execa('docker', [
	'run',
    '--name', 'clipzip-postgres',
    '-e', `POSTGRES_PASSWORD=${pass}`,
    '-e', `POSTGRES_USER=${user}`,
    '-e', `POSTGRES_DB=${db}`,
    '-e', `POSTGRES_HOST=${host}`,
    '-p', '5432:5432',
    '-d',
    'postgres'
]).stdout.pipe(process.stdout);

