#!/usr/bin/env node

const program = require('commander');
const generateVerilogTest = require('./verilog-test-gen');
const fs = require('fs');

const STANDARD_OUTFILE = 'test.v';
const STANDARD_TEMPLATE = 'testbench_template.v.handlebars';

program
	.arguments('<testfile>')
	.option('-o, --output [file]', 'the file the generated test will be written into, defaults to ' + STANDARD_OUTFILE)
	.option('-t, --template [file]', 'the file the template is read from, defaults to ' + STANDARD_OUTFILE)
	.action(function(testfile){
		const outfile = program.outfile || STANDARD_OUTFILE;
		const templatefile = program.templatefile || STANDARD_TEMPLATE;
		console.log('should read testfile %s and write output to %s', testfile, outfile);

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
				console.log('Will generate test');
				generateVerilogTest(test, template, function(err, data) {
					console.log('Generated test, writing it to file:');
					fs.writeFile(outfile, data, function(err) {
						if(err) {
							console.error("Can't write test out: " + err);
						}
						console.log("The file was saved! I'm done with everything.");
					});
				});
			});
		});
	})
	.parse(process.argv);

