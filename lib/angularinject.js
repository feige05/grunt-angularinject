/**
 * angularinject
 * @authors feige (feige_hu@foxmail.com)
 * @date    2014-09-30 13:25:31
 * @version $Id$
 */
var $ = {
	fs : require('fs'),
	path : require('path')
}


var filesCaught = [];
function detectComponents(blockType, opts){
	var files = [];
	var src  = $.path.resolve(opts.cwd);
	$.fs.readdirSync(src).forEach(function(file) {

            if ($.fs.statSync(src + '/' + file).isDirectory()) {

            } else if (/(.+)\.js$/.test(file)) {
                // 读出所有的文件
                //log('文件名:' + src + '/' + file);
                files.push(file);
            }
        });
	return files
};
function injectComponents(filePath, opts) {
	var Reg = {
		block: /(([ \t]*)<!--\s*angularinject:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*angularinject\s*-->)/gi,
		detect: {
			js: /<script.*src=['"]([^'"]+)/gi,
			css: /<link.*href=['"]([^'"]+)/gi
		},
		replace: {
			js: '<script src="{{filePath}}"></script>',
			css: '<link rel="stylesheet" href="{{filePath}}" />'
		}
	};
	var contents = String($.fs.readFileSync($.path.resolve(filePath)));
	var returnType = /\r\n/.test(contents) ? '\r\n' : '\n';
	var newContents;
	filesCaught = [];
	newContents = contents.replace(
		Reg.block,
		replaceIncludes(filePath, Reg, returnType)
	);

	if (contents !== newContents) {
		$.fs.writeFileSync(filePath, newContents);

		if (process.env.NODE_ENV !== 'test') {
			//console.log($.chalk.cyan(filePath) + ' modified.');
		}
	}
}
function replaceIncludes(file, Reg, returnType) {
  /**
   * Callback function after matching our regex from the source file.
   *
   * @param  {array}  match       strings that were matched
   * @param  {string} startBlock  the opening <!-- bower:xxx --> comment
   * @param  {string} spacing     the type and size of indentation
   * @param  {string} blockType   the type of block (js/css)
   * @param  {string} oldScripts  the old block of scripts we'll remove
   * @param  {string} endBlock    the closing <!-- endbower --> comment
   * @return {string} the new file contents
   */
  return function (match, startBlock, spacing, blockType, oldScripts, endBlock, offset, string) {
    
  	var ignorePath = /\.\.\//;
    var newFileContents = startBlock;
    var dependencies = detectComponents(blockType) || [];

    (string.substr(0, offset) + string.substr(offset + match.length)).
      replace(oldScripts, '').
      replace(Reg.block, '').
      replace(Reg.detect['js'], function (match, reference) {
        filesCaught.push(reference.replace(/['"\s]/g, ''));
        return match;
      });

    spacing = returnType + spacing.replace(/\r|\n/g, '');

    dependencies.
      map(function (filePath) {
        return $.path.join(
          $.path.relative($.path.dirname(file), $.path.dirname(filePath)),
          $.path.basename(filePath)
        ).replace(/\\/g, '/').replace(ignorePath, '');
      }).
      filter(function (filePath) {
        return filesCaught.indexOf(filePath) === -1;
      }).
      forEach(function (filePath) {
        if (typeof Reg.replace['js'] === 'function') {
          newFileContents += spacing + Reg.replace['js'](filePath);
        } else if (typeof Reg.replace['js'] === 'string') {
          newFileContents += spacing + Reg.replace['js'].replace('{{filePath}}', filePath);
        }
      });

    return newFileContents + spacing + endBlock;
  };
}

function angularinject(opts){
	var src = (Array.isArray(opts.src) ? opts.src : [opts.src])
		src.forEach(function(filePath){
			injectComponents(filePath, opts);
		})
}
module.exports = angularinject;
