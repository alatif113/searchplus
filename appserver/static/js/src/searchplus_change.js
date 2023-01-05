require([
    'jquery',
	'splunkjs/mvc',
	'splunkjs/mvc/searchmanager',
	'splunkjs/mvc/savedsearchmanager',
	"splunkjs/mvc/postprocessmanager",
	'splunkjs/mvc/simpleform/input/text',
	'splunkjs/mvc/simpleform/input/multiselect',
	"splunkjs/mvc/dropdownview",
	'/static/app/searchplus/js/sp_change_view.min.js',
	'/static/app/searchplus/js/sp_change_details_view.min.js',
	'/static/app/searchplus/js/format.min.js',
	'/static/app/searchplus/js/simplebar.min.js'
], function($, mvc, SearchManager, SavedSearchManager, PostProcessManager, TextInput, MultiSelectInput, DropdownView, SearchPlusChangeView, SearchPlusChangeDetailsView, format, SimpleBar) {
	
	let CHANGE_SM_QUERY = `\`sp_history_index\` source=sp_change_history earliest="$updated$" latest="now" title="*$keyword$*" | table title _time | sort -_time | eval earliest=_time-1, latest=_time+1, _time=strftime(_time, "%a %b %d, %Y %I:%M %p")`
	let CHANGE_DETAILS_SM_QUERY = `\`sp_history_index\` source=sp_change_history earliest=$earliest$ latest=$latest$ title="$title$" | head 1 | fields *`;

	let $dashboard = $('.dashboard-body').html(`
        <div class="view-container">
            <section aria-label="Search Filters" class="sidebar">
                <header class="sidebar-header">
                    <i class="icon icon-filter"></i><span class="result-count">0</span><span> Matched Changes</span>
                </header>
				<div class="sidebar-filters">
					<div class="input-container">
						<label><i class="icon icon-clock"></i>Last Updated</label>
						<div class="splunk-input-container input-updated"></div>
					</div>
					<div class="input-container">
						<label><i class="icon icon-search"></i>Title</label>
						<div class="splunk-input-container input-keyword"></div>
					</div>
				</div>
				<div class="sidebar-change-content" data-simplebar>
					<ul class="sidebar-list">
					</ul>
				</div>
            </section>
            <section class="content change-details-content">
				<header class="change-content-header">
					<div>Field</div>
					<div>Current Value</div>
					<div>Change From Previous Value</div>
				</header>
				<div class="scroll-container" data-simplebar>
					<ol class="search-results">
					</ol>
				</div>
            </section>
        </div>
    `);


    // #############################################
	// Search Managers
	// #############################################

    // Inputs Base Search Manager
    let ChangeSM = new SearchManager({
		id: "sm_change",
		data: 'results',
		preview: true,
		cache: true,
		search: CHANGE_SM_QUERY
	}, { tokens: true });

	// Inputs Base Search Manager
    let ChangeDetailsSM = new SearchManager({
		id: "sm_change_details",
		data: 'results',
		preview: true,
		cache: true,
		search: CHANGE_DETAILS_SM_QUERY
	}, { tokens: true });

	// #############################################
	// Views
	// #############################################
    let SPChangeView = new SearchPlusChangeView({
		id: "view_searchpluschange",
		managerid: "sm_change",
		el: $('.dashboard-body .sidebar-list')
	}).render();

	let SPChangeDetailsView = new SearchPlusChangeDetailsView({
		id: "view_searchpluschangedetails",
		managerid: "sm_change_details",
		el: $('.dashboard-body .search-results')
	}).render();

	// #############################################
	// Inputs
	// #############################################

	// Updated Input
    let UpdatedInput = new DropdownView({
		id: "input_updated",
		choices: [
			{label: "All Time", value: "-50y"}, 
			{label: "Last 1 Hour", value: "-1h"}, 
			{label: "Last 12 Hours", value: "-12h"}, 
			{label: "Last 1 Day", value: "-1d"},
			{label: "Last 7 Days", value: "-7d"},
			{label: "Last 1 Month", value: "-1mon"},
			{label: "Last 6 Months", value: "-6mon"},
			{label: "Last 1 Year", value: "-1y"},
		],
        default: "-50y",
		value: "$updated$",
        el: $('.input-updated')
    }, {tokens: true}).render();

	// Keyword Input
    let KeywordInput = new TextInput({
		id: "input_keyword",
		default: "",
		value: "$keyword$",
		el: $('.input-keyword')
	}, {tokens: true}).render();

	let defaultTokenModel = mvc.Components.get("default");

	ChangeSM.on('search:done', function(e) {
		let results = this.data('results');
		let result_count = results.attributes.manager.attributes.data.resultCount;
		$('.result-count', $dashboard).html(result_count.toLocaleString());
	});

});

