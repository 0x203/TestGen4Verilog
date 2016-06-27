
const fs = require('fs');
const handlebars = require('handlebars');

function generateVerilogTest(test, template, cb) {
	const compiledTemplate = handlebars.compile(template);

	//for now, just read data from a file
	fs.readFile('sample_tmpl_input.json', 'utf8', function(err, sampleDataJson) {
		if(err) {
			console.error("can't read sample input: " + err);
		}
		const sampleData = JSON.parse(sampleDataJson);
		const rendered = compiledTemplate(sampleData);
		cb(null, rendered)
	});
}

module.exports = generateVerilogTest;
