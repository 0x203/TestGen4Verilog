#!/usr/bin/env node
console.log('Hello, world!');

const program = require('commander');
const generateVerilogTest = require('./verilog-test-gen');
const fs = require('fs');

const STANDARD_OUTFILE = 'test.v';

program
    .arguments('<testfile>')
    .option('-o, --outfile [outfile]', 'the file the generated test will be written into, defaults to ' + STANDARD_OUTFILE)
    .action(function(testfile){
        const outfile = program.outfile || STANDARD_OUTFILE;
        console.log('should read testfile %s and write output to %s', testfile, outfile);

        fs.readFile(testfile, 'utf8', function (err, data) {
            if (err) {
                console.error("Can't read file with name '" + testfile + "'!");
                process.exit(1);
             }
            const test = JSON.parse(data);
            console.log('Will generate test');
            const verilog = generateVerilogTest(test);
            console.log('Generated test, writing it to file:');
            fs.writeFile(outfile, verilog, function(err) {
                if(err) {
                    console.error("Can't write test out: " + err)
                }
                console.log("The file was saved! I'm done with everything.");
            });
        });
    })
    .parse(process.argv)

