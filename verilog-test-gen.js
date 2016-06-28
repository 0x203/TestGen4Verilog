
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
	//try {
		console.log('Pre-compiling template');
		const compiledTemplate = handlebars.compile(template);
		console.log('Transforming test to usable data by template');
		const transformed = transformData(test);
		console.log(transformed);
		console.log('Compiling template');
		const rendered = compiledTemplate(transformed);
		cb(null, rendered)
	//} catch(err) {
	//	return cb(err);
	//}
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
	let activeEvents = [];

	const matrix = createMatrix(eventcount, test.edges);

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

function createMatrix(eventcount, edges) {
	let matrix = [];
	// initialize it with some new, zero-filled array
	for (let i = eventcount - 1; i >= 0; i--) {
		matrix[i] = Array(eventcount).fill(0);
	}

	// set 1s for all the edges
	for (let [source, target] of edges) {
		//console.log("setting 1 for edge %d -> %d", source, target);
		matrix[target - 1][source - 1] = 1;
	}
	return matrix;
}

module.exports = generateVerilogTest;
