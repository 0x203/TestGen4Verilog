
const fs = require('fs');
const handlebars = require('handlebars');

handlebars.registerHelper('counterType', function(signalType) {
	// used for generating return-to-zero when a signal goes down.
	if (signalType == "req")
		return "ack";
	else if (signalType == "ack")
		return "req";
	else
		return "Wrong signal type found!!! expected ack or req! argh!!";
});

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
