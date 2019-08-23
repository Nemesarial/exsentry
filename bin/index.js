#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { exportIssueToCSV } = require('../src/CSVExport.js')

const argv = require('yargs')
	.command('init <mapFile>', 'Create a map file', (yargs) => {
		yargs
			.positional('mapFile', {
				describe: 'The map file driving the csv export',
			})
	}, (argv) => {
		fs.writeFileSync(argv.mapFile, "module.exports = {\n\tissueId: 1111111,\n\tcsvExport: {\n\t\tfile: 'default_output.csv',\n\t\tincludeHeaders: true,\n\t\tfieldMap: {\n\t\t\tcsvFieldName:'dot.notation.access.to.response.property',\n\t\t\tcsvFieldName2(item){\n\t\t\t\treturn item.dot.notation.to.response.property.toUpperCase()\n\t\t\t}\n\t}\n}\n\n")
		fs.writeFileSync('.exsentry.json', '{\n\t"auth_key": "",\n\t"dsn": "https://sentry.io"\n}\n')
	})

	.command('export <mapFile> [options]', 'Export Sentry issue events to csv', (yargs) => {
		const argv = yargs
			.positional('mapFile', { describe: 'The map file driving the csv export' })
			.option('dsn', { alias: 'd', describe: 'Sentry server to connect to' })
			.option('token', { alias: 't', describe: 'Authentication Token' })
			.option('out', { alias: 'o', describe: 'Specify output file' })
			.option('open', { alias: 'x', describe: 'Open the csv afterward' })

	}, (argv) => {
		const credentials = ((dsn, token) => {
			let authFile = { "auth_key": null, "dsn": "https://errors.superbalist.com" }

			try {
				authFile = Object.assign({}, authFile, require(path.resolve(process.cwd(), '.exsentry.json')))
			} catch (e) { }

			if (dsn) authFile.dsn = dsn
			if (token) authFile.auth_key = token

			return authFile
		})(argv.dsn, argv.token)

		const map = ((out) => {
			let mapFile = {
				issueId: null,
				csvExport: {
					file: null,
					includeHeaders: true,
					fieldMap: {}
				}
			}

			try {
				mapFile = require(path.resolve(process.cwd(), argv.mapFile))
			} catch (e) { console.log(e.message) }
			if (out) mapFile.csvExport.file = out
			return mapFile
		})(argv.out)

		exportIssueToCSV(credentials, map, argv.open)
	})
	.demandCommand(1)
	.argv


