
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

handlebars.registerHelper('ingoingAcknowledge', function(signalType, options) {
   if(signalType == "ack") {
    return options.fn(this);
  } else {
    return options.inverse(this);
	}
});

handlebars.registerHelper('activateChannel', function(activateChannel, options) {
   if(activateChannel == 1) {
    return options.fn(this);
  } else {
    return options.inverse(this);
	}
});

function generateVerilogTest(test, template, cb) {
	//try {
		console.log('Pre-compiling template.');
		const compiledTemplate = handlebars.compile(template);
		console.log('Transforming test to usable data by template.');
		const transformed = transformData(test);
		// console.log(transformed);
		console.log('Compiling template.');
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
	if(!test.edges)
		throw "the edges should be defined!";
	if(!test.nodes)
		throw "the nodes should be defined!";

	const eventcount = test.nodes.length;
	const matrix = createMatrix(eventcount, test.edges);

	const {uutParameters, outgoing, ingoing, activeEvents} = tranformPortsAndEvents(test.ports, test.nodes);

	return {
		uutName: test.name,
		resetTime: test.resetTime || 10000,
		uutParameters,
		matrix,
		outgoing,
		ingoing,
		eventcount,
		eventcountMinusOne: eventcount - 1,
		activeEvents
	};
}

function tranformPortsAndEvents(ports, nodes) {
	let uutParameters = [];
	let outgoing = [];
	let ingoing = [];
	let activeEvents = [];

	for(let {activeSense, direction, name, channelId, dataWidth} of ports) {
		const withData = direction == 'input' || direction == 'output';

		// append uutParameters to the list
		uutParameters.push({channel: channelId, data: withData});

		// append outgoing signals specification
		let thisOutgoing = {
			type: (activeSense) ? 'ack' : 'req',
			channel: channelId
		}
		if (activeSense && direction == 'input') {
			//console.log("channel %d has outgoing data as active input", channelId);
			thisOutgoing.dataWidth = dataWidth;
		}
		else if (!activeSense && direction == 'output'){
			//console.log("channel %d has outgoing data as passive output", channelId);
			thisOutgoing.dataWidth = dataWidth;
		}
		outgoing.push(thisOutgoing);

		const {ingoingEvents, outgoingEvents} = splitIngoingFromOutgoing(activeSense, channelId, nodes);

		// build up 'ingoing' object
		const transformedIngoing = ingoingEvents.map(function(e) {
			if (e.data)
				return { eventIndex: e.id - 1, data: e.data.v };
			else
				return { eventIndex: e.id - 1 };
		});

		let thisIngoing = {
			type: (activeSense) ? 'req' : 'ack',
			channel: channelId,
			events: transformedIngoing
		}
		if (!activeSense && direction == 'input'){
			//console.log("channel %d has ingoing data as passive input", channelId);
			thisIngoing.dataWidth = dataWidth;
		}
		else if (activeSense && direction == 'output'){
			//console.log("channel %d has ingoing data as active output", channelId);
			thisIngoing.dataWidth = dataWidth;
		}
		ingoing.push(thisIngoing);


		// build up activeEvents
		const newActiveEvents = outgoingEvents.map(function(e) {
			let newActiveEvent = {
				id: e.id - 1,
				channel: e.channelId,
				type: shortType(e.type)
			};
			if (e.data) {
				newActiveEvent.dataWidth = dataWidth;
				newActiveEvent.data = e.data.v;
			}
			return newActiveEvent;
		});
		activeEvents.push.apply(activeEvents, newActiveEvents);
	}

	return {uutParameters, outgoing, ingoing, activeEvents};
}

function splitIngoingFromOutgoing(activeSense, channelId, allEvents) {
	const eventsOnThisPort = allEvents.filter(event => event.channelId == channelId);
	const reqs = eventsOnThisPort.filter(event => shortType(event.type) == 'req');
	const acks = eventsOnThisPort.filter(event => shortType(event.type) == 'ack');
	if(activeSense) {
		return {ingoingEvents: reqs, outgoingEvents: acks}
	} else {
		return {ingoingEvents: acks, outgoingEvents: reqs}
	}
}

function shortType(type) {
	if (type == 'Request' || type == 'DataRequest')
		return 'req';
	else if (type == 'Acknowledge' || type == 'DataAcknowledge')
		return 'ack';
	else
		throw "Found unknown type - no Acknowledge or Request or DataAcknowledge or DataRequest: " + type;
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
