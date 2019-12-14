define(function(require, exports, module){
 
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview'); 
    var _ = require("underscore");
    var $ = require("jquery");
    var sd_format = require("/static/app/searchdict/js/searchdict_format.js");
 
    // Define the custom view class
    var SearchDictView = SimpleSplunkView.extend({
 
        className: "sdview",
 
        // Define our initial values, set the type of results to return
        options: {
            data: "results"  // Results type
        },

        // Override this method to configure the view
        createView: function() {
            return this;
        },
 
        // Override this method to put the Splunk data into the view
        updateView: function(viz, data) {
			$("#sd_list").html("").append(`<li class="sd_resultcount">${data.length} results found</li>`);
			data.forEach(function(row) {
				var name = row[0];
				var updated = row[6];
				var earliest = row[4];
				var description = row[1].replace(/(^|\s+)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?[^. ])/gi, '$1<a class="sd_link" href="$2" target="_blank">$2</a>');
				var latest = row[5];
				var tags = row[3].join('</span><span class="sd_tag">');
				var query = row[2];
				var formatted_query = sd_format(query, false, true);
				var search = (/^\s*\|/.test(query)) ? '' : 'search%20';
				var searchUrl = "/app/search/search?q=" + search + encodeURI(query) + "&earliest=" + earliest + "&latest=" + latest;
				var editUrl = "/manager/searchdict/saved/searches?app=searchdict&count=10&offset=0&itemType=&owner=&search=" + encodeURI(name);
				var markup = `
					<li class="sd_listitem">
							<div class="sd_left">
									<div class="sd_name">${name}</div>
									<div class="sd_desc">${description}</div>
									<div class="sd_updated">Last Updated: ${updated}</div>
									<div class="sd_time">Time Range: ${earliest} - ${latest}</div>
									<div class="sd_taglist"><span class="sd_tag">${tags}</span></div>
							</div>
							<div class="sd_right">
									<div class="sd_options">
										<i class="sd_code_btn sd_icon_lines material-icons" data-attr-tooltip="Multiline">&#xe8ee</i>
										<i class="sd_code_btn sd_icon_highlight material-icons" data-attr-tooltip="Syntax Highlighting">&#xe23b</i>
										<i class="sd_code_btn sd_icon_copy material-icons" data-attr-tooltip="Copy">&#xe14d</i>
										<a href="${searchUrl}" target="_blank"><i class="sd_code_btn sd_icon_search material-icons" data-attr-tooltip="Open in Search">&#xe8b6</i></a>
										<a href="${editUrl}" target="_blank"><i class="sd_code_btn sd_icon_edit material-icons" data-attr-tooltip="Edit">&#xe3c9</i></a>
									</div>
									<div class="sd_query_container">
										<textarea class="sd_raw_query">${query}</textarea>
										<div class="sd_query">${formatted_query}</div>
									</div>
							</div>
					</li>`;
				$("#sd_list").append(markup);
			});
        }
    });
 
    return SearchDictView;
 
});
