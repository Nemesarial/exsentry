# ExSentry
*Quickly export CSV files from your Sentry Issue events. Just provide the authentication details, issueId and fieldMap.*

## Install
```
npm install -g exsentry
```

By typing this command you ask your OS system to install a package in global mode on your computer some errors may
happen due to some permissions, feel free to check how to allow the global installation of a nodejs package according to
your OS system.

> **Note** - If you have `npm@5.2.0` or later, you can run `exsentry` without installing by calling `npx exsentry export
> <mapFile> [options]`

## Usage

### Config files

#### Map File
`exsentry` requires you to have a map file that contains information about what Sentry issue you want to export the
events of. The format of that file is as follows:
```javascript
module.exports = {
	issueId: 1111111,
	csvExport: {
		file: 'default_output.csv',
		includeHeaders: true,
		fieldMap: {
			csvFieldName:'dot.notation.access.to.response.property',
			csvFieldName2: function(item){
				return item.dot.notation.to.response.property.toUpperCase()
			}
	}
}
```
**issueId** is the Sentry id for the issue you'd like to export.
**csvExport.file** The default output file.
**csvExport.includeHeaders** [boolean=true] Indicates whether you want headers to be printed in your CSV.
**csvExport.fieldMap** [object] The keys of this object will become fields in your CSV file. If you provide a string
value for a field, `exsentry` will find the target property and populate your CSV with that. If you provide a function,
`exsentry` will call that function for every event in your issue with that event as only input to the function. The
output will be used in the generation of the field value.

#### .exsentry.json Config file
The credentials for use against Sentry could be specified as input parameters to the `exsentry` command. One could also
add a `.exsentry.json` file in the same folder as your mapfile, to store your access config. It has this format:

```json
{
	"auth_key": "xxxx",
	"dsn": "https://sentry.io"
}
```

### Initializing with defaults
You don't have to manually create these files. 
```
exsentry init <mapFile>
```
This command will generate a skeleton mapFile and `.exsentry.json` file. Be careful though, this command overwrites
files of the same name with no warning.
