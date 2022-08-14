define(["/static/app/searchplus/js/prism.min.js"], function(Prism) {
	return function(str) {
		let indentlevel = 0;
		let linePrefix = '<span class="spl-row"><span class="spl-gutter"></span><div class="spl-code">';
		let lineSuffix = '</div></span>';
		let result = linePrefix; 
		let prevTok = '';
		let args = false;
		let line = str.replace(/[\r\n\s]+/g, ' '); //remove new lines and excessive whitespace
		let tokens = Prism.tokenize(line, Prism.languages['splunk-spl'])
		
		for (let i = 0; i < tokens.length; i++) {
			let newLine = false;
			let content = (typeof tokens[i] == 'object') ? tokens[i].content : tokens[i];
			let type = (typeof tokens[i] == 'object') ? tokens[i].type : 'default';
			
			if (content === "|") { 
				args = true; 
			}
			if (content === 'eval' || content === 'search' || content === 'where') { 
				args = false; 
			}
			if (args && type == 'property') { 
				type = 'argument'; 
			}				
			if (content === "|" && i != 0 && prevTok !== '[') {
				newLine = true;
			}
			if (content === "[" && i != 0) {
				indentlevel++;
				newLine = true;
			}
			if (content === "]") {
				indentlevel--;
				indentlevel = Math.max(indentlevel, 0);
			}
			if (newLine) {
				result += lineSuffix + linePrefix + "&nbsp;".repeat(indentlevel*4);
			}
			if (content !== " ") {
				prevTok = content;
			}
			
			if (type == 'default') {
				result += content;	
			} else {
				result += '<span class="spl-' + type + '">' + content + '</span>';
			}
		}
		
		result += lineSuffix;
		return result;
	}		
});	
