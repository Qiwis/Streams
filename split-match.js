var program = require('commander');
var fileSystem = require('fs');
var Transform = require('stream').Transform;
var util = require("util");
var chalk = require('chalk');

if(!Transform) {

    Transform = require('readable-stream/transform');

}

function PatternMatch(pattern) {

    if (!(this instanceof PatternMatch)) {

        return (new PatternMatch(pattern));

    }

    Transform.call(

        this,
        {
            objectMode: true
        }

    );

    if(!(pattern instanceof RegExp)) {

        pattern = new RegExp(pattern, "i");

    }

    var parts = pattern.toString().slice(1).split("/");
    var regex = parts[0];
    var flags = parts[1];

    if (flags.indexOf("g") === -1) {

        flags += "g";

    }

    this._pattern = new RegExp(regex, flags);
    this._inputBuffer = "";

};

util.inherits(PatternMatch, Transform);

PatternMatch.prototype._transform = function (chunk, encoding, getNextChunk) {

    console.log(chalk.bgRed.white(chunk.toString("utf8")));
    this._inputBuffer += chunk.toString("utf8");
    var nextOffset = null;
    var match = null;

    while ((match = this._pattern.exec(this._inputBuffer)) !== null) {

        var count = 1;

        if( /^[a-zA-Z]+$/.test(match[0]) ) {

            count = match[0].length;

        }

        if (this._pattern.lastIndex < this._inputBuffer.length) {

            this.push(chunk.toString().substring(nextOffset, this._pattern.lastIndex-count));

            nextOffset = this._pattern.lastIndex;

        } else {

            console.log(chalk.bgRed.white( "Need to defer '" + match[0] + "'since its at end of the chunk." ));

            nextOffset = match.index;

        }

    }

    if (nextOffset !== null) {

        this._inputBuffer = this._inputBuffer.slice(nextOffset);

    } else {

        this._inputBuffer = "";

    }

    this._pattern.lastIndex = 0;
    getNextChunk();

};

PatternMatch.prototype._flush = function (flushCompleted) {

    console.log(outputStream);
    console.log("_flush:", this._inputBuffer);
    var match = null;
    this_inputBuffer = "";
    this.push(null);
    flushCompleted();

};

/*-------------------------------------------------------------------------------------*/
/*-------------------------------------------------------------------------------------*/

program
    .version('0.0.1')
    .option('-p, --pattern <pattern>', 'Input Pattern such as . ,')
    .parse(process.argv);

var regex = null;
var regexString = 0;

if(program.pattern === ",") {

    regex = /\,+/i;

} else if(program.pattern === ".") {

    regex = /\.+/i;

} else {

    regex = program.pattern;

}

var inputStream = fileSystem.createReadStream('./input-sensor.txt');
var patternStream = inputStream.pipe(new PatternMatch( regex ));
var outputStream = [];
patternStream.on('readable', function() {

    var content = null;

    while (content = this.read()) {

        if(content.toString().substring(0,1) === " ") {

            outputStream.push(content.toString().substring(1, content.toString().length));

        } else {

            outputStream.push(content.toString());

        }

    }

});
