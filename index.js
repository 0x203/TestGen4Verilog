#!/usr/bin/env node

const program = require('commander');
const generateVerilogTest = require('./verilog-test-gen');
const fs = require('fs');

const STANDARD_OUTFILE = 'test.v';
const STANDARD_TEMPLATE = __dirname + '/testbench_template.v.handlebars';

program
	.option('-o, --output [file]', 'the file the generated test will be written into, defaults to ' + STANDARD_OUTFILE)
	.option('-t, --template [file]', 'the file the template is read from, defaults to ' + STANDARD_OUTFILE)
	.arguments('<testfile>')
	.action(function(testfile){
		console.log(program);
		console.log(program.outfile);
		const outfile = program.output || STANDARD_OUTFILE;
		const templatefile = program.template || STANDARD_TEMPLATE;
		console.log("Will read test from '%s' and write generated testbench to '%s'.", testfile, outfile);

		fs.readFile(testfile, 'utf8', function (err, jsontest) {
			if (err) {
				console.error("Can't read file with name '" + testfile + "'!");
				process.exit(1);
			}
			fs.readFile(templatefile, 'utf8', function(err, template) {
				if (err) {
					console.error("Can't read file with name '" + testfile + "'!");
					process.exit(1);
				}
				const test = JSON.parse(jsontest);
				console.log('Will generate test.');
				generateVerilogTest(test, template, function(err, data) {
					console.log('Generated test, writing it to file.');
					fs.writeFile(outfile, data, function(err) {
						if(err) {
							console.error("Can't write test out: " + err);
						}
						console.log("Testbench saved in '%s'! I'm done with everything.", outfile);
					});
				});
			});
		});
	})
	.parse(process.argv);

