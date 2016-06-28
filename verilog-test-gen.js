
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
	try {
		const compiledTemplate = handlebars.compile(template);
		const transformed = transformData(test);
		console.log(transformed);
		const rendered = compiledTemplate(transformed);
		cb(null, rendered)
	} catch(err) {
		return cb(err);
	}
}

function transformData(test) {
	if(!test.name)
		throw "UUT must have a name!";
	if(!test.ports)
		throw "the ports should be defined!";

	const eventcount = test.nodes.length;

	let uutParameters = [];
	let outgoing = [];
	let ingoing = [];
	let matrix = Array(eventcount).fill(Array(eventcount).fill(0));
	let activeEvents = [];

	return {
		uutName: test.name,
		uutParameters,
		outgoing,
		ingoing,
		eventcount,
		eventcountMinusOne: eventcount - 1,
		matrix,
		activeEvents
	};
}

module.exports = generateVerilogTest;
