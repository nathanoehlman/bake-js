var getit = require('getit'),
    path = require('path'),
    fs = require('fs'),
    out = require('out'),
    BakeStream = require('./bakestream');

function _process(targetFile, hideOutput) {
    var input = fs.createReadStream(targetFile),
        processor = new BakeStream({ quiet: hideOutput });
        
    if (! hideOutput) {
        out('!{grey}reading: !{grey,underline}{0}', targetFile);
    }
        
    // pipe the input stream to the processor
    return input.pipe(processor);
}

exports = module.exports = function(args, program) {
    var action = typeof args == 'string' ? args : args[0];

    // if the action maps to a path, then process that path
    fs.stat(action, function(err, stats) {
        if ((! err) && stats.isFile()) {
            _process(action)
                // handle errors
                .on('error', out.bind(null, '!{red}{0}'))
                
                // direct the output accordingly
                .on('end', out.bind(null, '!{check,green} done'))
                .pipe(program.out ? fs.createWriteStream(program.out) : process.stdout);
        }
        else {
            var handler;
            
            try {
                handler = require('./commands/' + action);
            }
            catch (e) {
            }
            
            if (typeof handler == 'function') {
                handler.apply(null, args.slice(1).concat(function() {
                    
                }));
            }
        }
    });
};

exports.process = _process;