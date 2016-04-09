// Included Modules
var program = require('commander');
var fileSystem = require('fs');
var Transform = require('stream').Transform;
var util = require("util");
var chalk = require('chalk');

// For Node 0.8 Users
if(!Transform) {

    Transform = require('readable-stream/transform');

}

// Transform Stream Object with I/O functionality for read and write services
// @pattern: a string to be converted to a RegExp object to allow matching
function PatternMatch(pattern) {

    // If the function call was not declared as a "new" object
    if (!(this instanceof PatternMatch)) {

        return (new PatternMatch(pattern));

    }

    // Call to super constructor
    // Switch objectMode #t so when streams are read it emites single pattern match
    Transform.call(

        this,
        {
            objectMode: true
        }

    );

    // Error Handling to ensure that pattern is a RegExp object
    if(!(pattern instanceof RegExp)) {

        pattern = new RegExp(pattern, "i");

    }

    // Segregate the input into the regex and flag parts
    var parts = pattern.toString().slice(1).split("/");
    var regex = parts[0];
    var flags = parts[1];

    // Ensure that the regex has the flag 'g'(global) up
    if (flags.indexOf("g") === -1) {

        flags += "g";

    }

    // Construct the RegExp and connect to this._pattern to allow global usage through PatternMatch functions
    this._pattern = new RegExp(regex, flags);
    // Declare this._inputBuffer to continually hold un-transformed data from the stream
    this._inputBuffer = "";

};

// Extend the transformer class
util.inherits(PatternMatch, Transform);

// Transform classes require that we implement a single method called _transform and
// optionally implement a method called _flush.
PatternMatch.prototype._transform = function (chunk, encoding, getNextChunk) {

    // print the initial chunk which should be the original input
    console.log(chalk.bgRed.white(chunk.toString("utf8")));
    // let the buffer capture the untransformed data
    this._inputBuffer += chunk.toString("utf8");
    // decalre nextOffset to keep track of the position of chunk
    var nextOffset = null;
    // declare match to be filled when there is a pattern match
    var match = null;

    // loop over the matches in the chunk
    while ((match = this._pattern.exec(this._inputBuffer)) !== null) {

        // declare a count var to handle indexing for string values
        var count = 1;

        // if the match is a string with letters
        if( /^[a-zA-Z]+$/.test(match[0]) ) {

            // update counter to the length of the string
            count = match[0].length;

        }

        // if the pattern match is within the range of the chunk size
        if (this._pattern.lastIndex < this._inputBuffer.length) {

            // push a new chunk to the transform method
            this.push(chunk.toString().substring(nextOffset, this._pattern.lastIndex-count));

            // declare the new index of the chunk
            nextOffset = this._pattern.lastIndex;

        } else {

            // if for some reason, the pattern match extends beyond the range of chunk then defer ut to the next chunk.
            console.log(chalk.bgRed.white( "Need to defer '" + match[0] + "'since its at end of the chunk." ));

            // declare the next best match index
            nextOffset = match.index;

        }

    }

    // if the nextOffset is still declared then there is still data in the chunk
    if (nextOffset !== null) {

        // slice the matched chunked, and store whatever was leftover
        this._inputBuffer = this._inputBuffer.slice(nextOffset);

    } else {

        // when there is not a declared nextOffset to reference the next match, empty the buffer
        this._inputBuffer = "";

    }

    // decalre the lastIndex of pattern to 0 so that it could start at the beginning of the new buffer
    this._pattern.lastIndex = 0;
    // find the transform call, and get the next call
    getNextChunk();

};

//After stream has been read and transformed, the _flush method is called.
//It is a place to push values to output stream and clean up existing data.
PatternMatch.prototype._flush = function (flushCompleted) {

    // print the output of PatternMatch_transform
    console.log(outputStream);
    console.log("_flush:", this._inputBuffer);
    var match = null;
    this_inputBuffer = "";
    this.push(null);
    flushCompleted();

};

/*-------------------------------------------------------------------------------------*/
/*-------------------------------------------------------------------------------------*/

//program module for taking command line inputs
program
    .version('0.0.1')
    .option('-p, --pattern <pattern>', 'Input Pattern such as . ,')
    .parse(process.argv);

//declare regex var to hold regex syntax
var regex = null;

//appropriately assign the correct pattern to regex
if(program.pattern === ",") {

    regex = /\,+/i;

} else if(program.pattern === ".") {

    regex = /\.+/i;

} else {

    regex = program.pattern;

}

//create inputStream from fileSystem module
var inputStream = fileSystem.createReadStream('./input-sensor.txt');
//create a patternStream that will run through the input and find matches
var patternStream = inputStream.pipe(PatternMatch( regex ));
//create the outputStream
var outputStream = [];

//read matches from the stream
patternStream.on('readable', function() {

    //create content var for matches in the stream
    var content = null;

    while (content = this.read()) {

        //push appropriate content to the output stream
        if(content.toString().substring(0,1) === " ") {

            outputStream.push(content.toString().substring(1, content.toString().length));

        } else {

            outputStream.push(content.toString());

        }

    }

});
