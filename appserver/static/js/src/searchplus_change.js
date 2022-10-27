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
	'/static/app/searchplus/js/format.min.js',
	'/static/app/searchplus/js/simplebar.min.js'
], function($, mvc, SearchManager, SavedSearchManager, PostProcessManager, TextInput, MultiSelectInput, DropdownView, SearchPlusChangeView, format) {
	
	let CHANGE_SM_QUERY = `\`sp_history_index\` source="Search Inventory Iterative - Lookup Gen" earliest=-90d latest=now | stats first(_time) as _time first(change) as change first(title) as title by change_id`

	let $dashboard = $('.dashboard-body').html(`
        <div class="view-container">
            <section aria-label="Search Filters" class="sidebar">
                <header class="sidebar-header">
                    <i class="icon icon-filter"></i><span class="result-count">0</span><span> Matched Searches</span>
                    <button class="btn-more btn-transparent"><i class="icon icon-more right-align"></i></button>
                </header>
                <ul class="sidebar-content" data-simplebar>
                </ul>
            </section>
            <section class="content">
                
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

	// #############################################
	// Views
	// #############################################
    let SPChangeView = new SearchPlusChangeView({
		id: "view_searchpluschange",
		managerid: "sm_change",
		el: $('.dashboard-body .sidebar-content')
	}).render();

});