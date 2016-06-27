#!/usr/bin/env node
console.log('Hello, world!');

const program = require('commander');

const STANDARD_OUTFILE = 'test.v'

program
    .arguments('<testfile>')
    .option('-o, --outfile [outfile]', 'the file the generated test will be written into, defaults to ' + STANDARD_OUTFILE)
    .action(function(testfile){
        const outfile = program.outfile || STANDARD_OUTFILE
        console.log('should read testfile %s and write output to %s', testfile, outfile)
    })
    .parse(process.argv)

