const fs = require('fs')
class CSVExport {
	constructor(config) {
		this.config = Object.assign({
			file: null,
			includeHeaders: true,
			fieldMap: {
			}
		}, config)
		this.fieldList = Object.keys(this.config.fieldMap)
		this.csvData = []
		if (this.config.includeHeaders) this.csvData.push(this.fieldList)
	}

	processArray (list) {
		list.forEach(this.processLine.bind(this))
	}

	processLine (item) {
		this.csvData.push(this.fieldList.map(field => this.getField(item, field)))
	}

	getField (item, field) {
		const accessorString = this.config.fieldMap[field]
		if (typeof accessorString === 'function') {
			let output = ''
			try {
				output = accessorString(item)
			} catch (e) {
				throw new Error(`The function mapped to '${field}' in ${this.file} is causing this error: \n${e.message}`)
			}
			return output
		}
		const accessor = accessorString.split('.')
		const extractField = (data, accesssor) => {
			if (accesssor.length > 0) {
				const slice = accessor.shift()
				if (typeof (data) === 'object') {
					if (data.hasOwnProperty(slice)) {
						return extractField(data[slice], accessor)
					} else {
						return ''
					}
				} else {
					return ''
				}
			}
			return ('' + data).replace('"', '\"')
		}
		return extractField(item, accessor)
	}

	toString () {
		return this.csvData.map(line => `"${line.join('","')}"`).join('\n')
	}
	log () {
		console.log(this.toString())
	}

	writeFile () {
		if (this.config.file) {
			fs.writeFile(this.config.file, this.toString(), () => { })
		}
	}
}

const exportIssueToCSV = (credentials, map, open=false) => {
	const axios = require('axios')
	const apiConfig = {
		baseURL: credentials.dsn,
		headers: { 'Authorization': `Bearer ${credentials.auth_key}` }
	}
	const api = axios.create(apiConfig)

	const fetchData = async function(url, csv) {
		process.stdout.write('.')
		const response = (await api.get(url))
		const data = response.data
		if (map.csvExport) {
			csv.processArray(data)
		}

		if (response.headers.hasOwnProperty('link')) {
			const next = response.headers.link.split(',').map(link => {
				let [url, direction, hasResults, cursor] = link.split(';').map(item => item.trim())
				hasResults = hasResults.replace(/results="([^"]*)"/g, "$1") == 'true'
				direction = direction.replace(/rel="([^"]*)"/g, "$1")
				url = url.replace(/<([^>]*)>/g, "$1")
				return { url, direction, hasResults, cursor }
			}).filter(link => link.direction === 'next')[0]
			if (next && next.hasResults) {
				return await fetchData(next.url, csv)
			} else {
				return
			}
		} else {
			return
		}
		
	}
	
	if (map.issueId) {
		const csv = new CSVExport(map.csvExport)
		process.stdout.write('Loading ')
		fetchData(`/api/0/issues/${map.issueId}/events/`, csv).then(() => {
			csv.writeFile()
			console.log(`\n\nIssue ${map.issueId} exported to ${csv.config.file} (${csv.csvData.length-1} rows)`)
			if(open){
				console.log(`... opening ${csv.config.file}\n\n`)
				require('child_process').spawn('open',[csv.config.file],{cwd:process.cwd()}).unref()
			}
		})
	}

}

module.exports = {
	CSVExport,
	exportIssueToCSV
}
