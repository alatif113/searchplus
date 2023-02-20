require([
    'jquery',
	'splunkjs/mvc',
	'splunkjs/mvc/searchmanager',
	'splunkjs/mvc/savedsearchmanager',
	"splunkjs/mvc/postprocessmanager",
	'splunkjs/mvc/simpleform/input/text',
	'splunkjs/mvc/simpleform/input/multiselect',
	"splunkjs/mvc/dropdownview",
	'/static/app/searchplus/js/sp_view.min.js',
	'/static/app/searchplus/js/format.min.js',
	'/static/app/searchplus/js/simplebar.min.js'
], function($, mvc, SearchManager, SavedSearchManager, PostProcessManager, TextInput, MultiSelectInput, DropdownView, SearchPlusView, format) {

    let PAGINATION_CURRENT_PAGE = 1;
    let PAGINATION_COUNT_PER_PAGE = 100;
    let INPUTS_SM_QUERY = `| inputlookup sp_search_inventory where status=$status$
		| search title="*$keyword$*" OR description="*$keyword$*"
        | where _time >= coalesce(relative_time(now(), "$updated$"), 0)
        | foreach command datamodel field index macro lookup function mtr_tactic mtr_technique
            [eval <<FIELD>>=split(<<FIELD>>, "|")]`;
    let CONTENT_SM_QUERY = `| inputlookup sp_search_inventory where status=$status$
		| search title="*$keyword$*" OR description="*$keyword$*"
        | where _time >= coalesce(relative_time(now(), "$updated$"), 0)
        | foreach command datamodel field index macro lookup function mtr_tactic mtr_technique
            [eval <<FIELD>>=lower(split(<<FIELD>>, "|"))]
        | fillnull command datamodel field index macro lookup function mtr_tactic mtr_technique security_domain severity value="N/A"
        | search correlation_search=$correlation$ security_domain IN ($securitydomain$) severity IN ($severity$) field IN ($field$) app IN ($app$) owner IN ($owner$) command IN ($command$) datamodel IN ($datamodel$) index IN ($index$) macro IN ($macro$) lookup IN ($lookup$) function IN ($function$) mtr_tactic IN ($tactic$) mtr_technique IN ($technique$)
        | join type=left title [| inputlookup sp_search_resource_usage.csv]
        | sort $sortorder$$sort$`;
	let PAGINATION_SM_QUERY = `| streamstats count
		| search count > $min_offset$  count <= $max_offset$`;

    let tokens = mvc.Components.get("default");
    
    update_page_offsets(PAGINATION_CURRENT_PAGE, PAGINATION_COUNT_PER_PAGE);

	let $dashboard = $('.dashboard-body').html(`
        <div class="view-container">
            <section aria-label="Search Filters" class="sidebar">
                <header class="sidebar-header">
                    <i class="icon icon-filter"></i><span class="result-count">0</span><span> Matched Searches</span>
                    <button class="btn-more btn-transparent"><i class="icon icon-more right-align"></i></button>
                </header>
                <div class="sidebar-content" data-simplebar>
                    <section aria-label="General Filters" class="input-group">
                        <header class="input-group-label">
                            <h1>General Filters</h1>
                            <button class="btn-transparent"><i class="icon icon-minus right-align"></i></button>
                        </header>
                        <div class="input-container">
                            <label><i class="icon icon-sort"></i>Sort By</label>
                            <div class="splunk-input-container input-sort"></div>
                        </div>
						<div class="input-container">
                            <label><i class="icon icon-sort"></i>Sort Order</label>
                            <div class="splunk-input-container input-sortorder"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-clock"></i>Last Updated</label>
                            <div class="splunk-input-container input-updated"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-search"></i>Title / Description</label>
                            <div class="splunk-input-container input-keyword"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-folder"></i>App</label>
                            <div class="splunk-input-container input-app"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-user"></i>Owner</label>
                            <div class="splunk-input-container input-owner"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-toggle"></i>Status</label>
                            <div class="splunk-input-container input-status"></div>
                        </div>
                    </section>
                    <section aria-label="Attribute Filters" class="input-group">
                        <header class="input-group-label">
                            <h1>Attribute Filters</h1>
                            <button class="btn-transparent"><i class="icon icon-minus right-align"></i></button>
                        </header>
                        <div class="input-container">
                            <label><i class="icon icon-command"></i>Commands</label>
                            <div class="splunk-input-container input-command"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-datamodel"></i>Datamodels</label>
                            <div class="splunk-input-container input-datamodel"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-field"></i>Fields</label>
                            <div class="splunk-input-container input-field"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-function"></i>Functions</label>
                            <div class="splunk-input-container input-function"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-index"></i>Indexes</label>
                            <div class="splunk-input-container input-index"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-lookup"></i>Lookups</label>
                            <div class="splunk-input-container input-lookup"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-macro"></i>Macros</label>
                            <div class="splunk-input-container input-macro"></div>
                        </div>
                    </section>
                    <section aria-label="Correlation Search Filters" class="input-group">
                        <header class="input-group-label">
                            <h1>Correlation Search Filters</h1>
                            <button class="btn-transparent"><i class="icon icon-minus right-align"></i></button>
                        </header>
                        <div class="input-container">
                            <label><i class="icon icon-correlation"></i>Correlation Search</label>
                            <div class="splunk-input-container input-correlation"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-securitydomain"></i>Security Domain</label>
                            <div class="splunk-input-container input-securitydomain"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-severity"></i>Severity</label>
                            <div class="splunk-input-container input-severity"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-tactic"></i>MITRE ATT&CK Tactics</label>
                            <div class="splunk-input-container input-tactic"></div>
                        </div>
                        <div class="input-container">
                            <label><i class="icon icon-technique"></i>MITRE ATT&CK Techniques</label>
                            <div class="splunk-input-container input-technique"></div>
                        </div>
                    </section>
                </div>
            </section>
            <section class="content">
                <header class="content-header">
                    <div role="none"></div>
                    <div><i class="icon icon-search"></i>Title</div>
                    <div><i class="icon icon-folder"></i>App</div>
                    <div><i class="icon icon-user"></i>Owner</div>
                    <div><i class="icon icon-clock"></i>Updated</div>
                    <div><i class="icon icon-calendar"></i>Next Scheduled Time</div>
                    <div><i class="icon icon-share"></i>Sharing</div>
                    <div><i class="icon icon-toggle"></i>Status</div>
                </header>
				<div class="scroll-container" data-simplebar>
					<ol class="search-results">
					</ol>
				</div>
                <ul class="pagination" role="list"></ul>
            </section>
        </div>
    `);

    // #############################################
	// Search Managers
	// #############################################

    // Inputs Base Search Manager
    let InputsSM = new SearchManager({
		id: "sm_inputs",
		data: 'results',
		preview: true,
		cache: true,
		search: INPUTS_SM_QUERY
	}, { tokens: true });

    // Content Base Search Manager
    let ContentSM = new SearchManager({
		id: "sm_content",
		data: 'results',
		preview: true,
		cache: true,
		search: CONTENT_SM_QUERY
	}, { tokens: true });

    // Pagination Search Manager
    let PaginationSM = new PostProcessManager({
		id: "sm_pagination",
		manager: "sm_content",
		data: 'results',
		preview: true,
		cache: true,
		search: PAGINATION_SM_QUERY
	}, { tokens: true });

    // Pagination Search Manager
    let RebuildSM = new SavedSearchManager({
		id: "sm_rebuild",
		searchname: "Search Inventory - Lookup Gen",
		app: "searchplus",
		autostart: false
	});

	let ResourceSM = new SavedSearchManager({
		id: "sm_resource",
		searchname: "Search Resource Usage - Lookup Gen",
		app: "searchplus",
		autostart: false
	});

    // #############################################
	// Views
	// #############################################
    let SPView = new SearchPlusView({
		id: "view_searchplus",
		managerid: "sm_pagination",
		el: $('.dashboard-body .search-results')
	}).render();

	//new SimpleBar($('.dashboard-body .search-results')[0]);

    // #############################################
	// Inputs
	// #############################################
	let input_list = [];

    // Updated Input
    let UpdatedInput = new DropdownView({
		id: "input_updated",
		choices: [
			{label: "All Time", value: "-1000y"}, 
			{label: "Last 1 Hour", value: "-1h"}, 
			{label: "Last 12 Hours", value: "-12h"}, 
			{label: "Last 1 Day", value: "-1d"},
			{label: "Last 7 Days", value: "-7d"},
			{label: "Last 1 Month", value: "-1mon"},
			{label: "Last 6 Months", value: "-6mon"},
			{label: "Last 1 Year", value: "-1y"},
		],
        default: "-1000y",
		value: "$updated$",
        el: $('.input-updated')
    }, {tokens: true}).render();

	input_list.push(UpdatedInput);

    // Sort Input
    let SortInput = new DropdownView({
		id: "input_sort",
		choices: [
			{label: "Title", value: "title"}, 
			{label: "App", value: "app"}, 
			{label: "Owner", value: "owner"}, 
			{label: "Updated", value: "updated"}, 
			{label: "Next Scheduled Time", value: "next_scheduled_time"}, 
			{label: "Sharing", value: "sharing"}, 
			{label: "Status", value: "status"}, 
			{label: "Skipped Percentage", value: "skipped"},
			{label: "Avg. Memory Used", value: "mem_used"},
			{label: "Avg. Run Time", value: "run_time"},
			{label: "Avg. Events Scanned", value: "scan_count"},
			{label: "Avg. Result Count", value: "result_count"}
		],
        default: "title",
		value: "$sort$",
        el: $('.input-sort')
    }, {tokens: true}).render();

	input_list.push(SortInput);

	// Sort Input
    let SortOrderInput = new DropdownView({
		id: "input_sortorder",
		choices: [
			{label: "Ascending", value: "+"}, 
			{label: "Descending", value: "-"}, 
		],
        default: "+",
		value: "$sortorder$",
        el: $('.input-sortorder')
    }, {tokens: true}).render();

	input_list.push(SortOrderInput);

    // Keyword Input
    let KeywordInput = new TextInput({
		id: "input_keyword",
		default: "",
		value: "$keyword$",
		el: $('.input-keyword')
	}, {tokens: true}).render();

	input_list.push(KeywordInput);

    // App Input
    new PostProcessManager({
		id: "sm_app",
		managerid: "sm_inputs",
		search: '| table app | dedup app | sort app'
	});

	var AppInput = new MultiSelectInput({
		id: "input_app",
		choices: [{label: "All", value: "*"}],
        default: "*",
		managerid: "sm_app",
		labelField: "app",
		valueField: "app",
		value: "$app$",
		el: $('.input-app')
	}, {tokens: true}).render();

	input_list.push(AppInput);
    multi_handle_all(AppInput);

    // Owner Input
    new PostProcessManager({
		id: "sm_owner",
		managerid: "sm_inputs",
		search: '| stats count by owner | sort owner'
	});

	let OwnerInput = new MultiSelectInput({
		id: "input_owner",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_owner",
		labelField: "owner",
		valueField: "owner",
		value: "$owner$",
		el: $('.input-owner')
	}, {tokens: true}).render();

	input_list.push(OwnerInput);
    multi_handle_all(OwnerInput);

    // Status Input
    let StatusInput = new DropdownView({
		id: "input_status",
		choices: [{label: "All", value: "*"}, {label: "Enabled", value: "enabled"}, {label: "Disabled", value: "disabled"}],
        default: "*",
		value: "$status$",
        el: $('.input-status')
	}, {tokens: true}).render();

	input_list.push(StatusInput);

    // Command Input
    new PostProcessManager({
		id: "sm_command",
		managerid: "sm_inputs",
		search: '| stats count by command | sort command'
	});

	let CommandInput = new MultiSelectInput({
		id: "input_command",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_command",
		labelField: "command",
		valueField: "command",
		value: "$command$",
		el: $('.input-command')
	}, {tokens: true}).render();

	input_list.push(CommandInput);
    multi_handle_all(CommandInput);

    // Datamodel Input
    new PostProcessManager({
		id: "sm_datamodel",
		managerid: "sm_inputs",
		search: '| stats count by datamodel | sort datamodel'
	});

	let DataModelInput = new MultiSelectInput({
		id: "input_datamodel",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_datamodel",
		labelField: "datamodel",
		valueField: "datamodel",
		value: "$datamodel$",
		el: $('.input-datamodel')
	}, {tokens: true}).render();

	input_list.push(DataModelInput);
    multi_handle_all(DataModelInput);

    // Field Input
    let FieldInput = new MultiSelectInput({
		id: "input_field",
		allowCustomValues: true,
		choices: [{label: "All", value: "*"}],
		default: "*",
		value: "$field$",
		el: $('.input-field')
	}, {tokens: true}).render();

	input_list.push(FieldInput);
    multi_handle_all(FieldInput);

    // Function Input
    new PostProcessManager({
		id: "sm_function",
		managerid: "sm_inputs",
		search: '| stats count by function | sort function'
	});

	let FunctionInput = new MultiSelectInput({
		id: "input_function",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_function",
		labelField: "function",
		valueField: "function",
		value: "$function$",
		el: $('.input-function')
	}, {tokens: true}).render();

	input_list.push(FunctionInput);
    multi_handle_all(FunctionInput);

    // Index Input
    new PostProcessManager({
		id: "sm_index",
		managerid: "sm_inputs",
		search: '| stats count by index | sort index'
	});

	let IndexInput = new MultiSelectInput({
		id: "input_index",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_index",
		labelField: "index",
		valueField: "index",
		value: "$index$",
		el: $('.input-index')
	}, {tokens: true}).render();

	input_list.push(IndexInput);
    multi_handle_all(IndexInput);

    // Lookup Input
    new PostProcessManager({
		id: "sm_lookup",
		managerid: "sm_inputs",
		search: '| stats count by lookup | sort lookup'
	});

	let LookupInput = new MultiSelectInput({
		id: "input_lookup",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_lookup",
		labelField: "lookup",
		valueField: "lookup",
		value: "$lookup$",
		el: $('.input-lookup')
	}, {tokens: true}).render();

	input_list.push(LookupInput);
    multi_handle_all(LookupInput);

    // Macro Input
    new PostProcessManager({
		id: "sm_macro",
		managerid: "sm_inputs",
		search: '| stats count by macro | sort macro'
	});

	let MacroInput = new MultiSelectInput({
		id: "input_macro",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_macro",
		labelField: "macro",
		valueField: "macro",
		value: "$macro$",
		el: $('.input-macro')
	}, {tokens: true}).render();

	input_list.push(MacroInput);
    multi_handle_all(MacroInput);


	// Correlation Search Input
	var CorrelationInput = new DropdownView({
		id: "input_correlation",
		choices: [{label: "All", value: "*"}, {label: "Yes", value: "yes"}, {label: "No", value: "no"}],
        default: "*",
		value: "$correlation$",
        el: $('.input-correlation')
	}, {tokens: true}).render();

	// Severity Input
	var SeverityInput = new MultiSelectInput({
		id: "input_severity",
		choices: [{label: "All", value: "*"}, {label: "Critical", value: "critical"}, {label: "High", value: "high"}, {label: "Medium", value: "medium"}, {label: "Low", value: "low"}, {label: "Informational", value: "informational"}],
		default: "*",
		value: "$severity$",
		el: $('.input-severity')
	}, {tokens: true}).render();

	input_list.push(SeverityInput);
    multi_handle_all(SeverityInput);

	// Security Domain Input
	new PostProcessManager({
		id: "sm_securitydomain",
		managerid: "sm_inputs",
		search: '| stats count by security_domain | sort security_domain'
	});

	var SecurityDomainInput = new MultiSelectInput({
		id: "input_securitydomain",
		choices: [{label: "All", value: "*"}],
		default: "*",
		value: "$securitydomain$",
		managerid: "sm_securitydomain",
		labelField: "security_domain",
		valueField: "security_domain",
		el: $('.input-securitydomain')
	}, {tokens: true}).render();

	input_list.push(SecurityDomainInput);
    multi_handle_all(SecurityDomainInput);

	// Tactic Input
	new PostProcessManager({
		id: "sm_tactic",
		managerid: "sm_inputs",
		search: '| stats count by mtr_tactic | sort mtr_tactic | eval mtr_tactic_quoted="\\"".mtr_tactic."\\""'
	});

	var TacticInput = new MultiSelectInput({
		id: "input_tactic",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_tactic",
		labelField: "mtr_tactic",
		valueField: "mtr_tactic_quoted",
		value: "$tactic$",
		el: $('.input-tactic')
	}, {tokens: true}).render();

	input_list.push(TacticInput);
    multi_handle_all(TacticInput);


	// Technique Input
	new PostProcessManager({
		id: "sm_technique",
		managerid: "sm_inputs",
		search: '| stats count by mtr_technique | sort mtr_technique | eval mtr_technique_quoted="\\"".mtr_technique."\\""'
	});

	var TechniqueInput= new MultiSelectInput({
		id: "input_techniuqe",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "sm_technique",
		labelField: "mtr_technique",
		valueField: "mtr_technique_quoted",
		value: "$technique$",
		el: $('.input-technique')
	}, {tokens: true}).render();
  
	input_list.push(TechniqueInput);
    multi_handle_all(TechniqueInput);

    // #############################################
	// Events
	// #############################################

    ContentSM.on('search:done', function(e) {
		let results = this.data('results');
		let result_count = results.attributes.manager.attributes.data.resultCount;
		$('.result-count', $dashboard).html(result_count.toLocaleString());

		let $pagination = $('.pagination', $dashboard);
		create_pagination($pagination, result_count, 1);
	});

    $('.input-group-label button').on('click', function() {
		$(this).closest('section').children('div').toggle();
        let $icon = $('i.icon', $(this));
		if ($icon.hasClass('icon-minus')) {
			$icon.removeClass('icon-minus').addClass('icon-plus');
		} else {
            $icon.removeClass('icon-plus').addClass('icon-minus');
		}
	});

    $('.btn-more').on('click', function(e) {
		let query = ContentSM.query.attributes.search;
		let search_url = '/app/searchplus/search?q=' + encodeURIComponent(query);
		let $modal = $(`
            <div class="modal fade modal-wide">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                    <h1>Search+ Configuration</h1>
                </div>
                <div class="modal-body">
                    <section class="">
                        <h2>Filtered Search Query</h2>
                        <p>The filtered search list is generated using this query.</p>
                        <div class="query-container">    
                            <div class="query-overflow" data-simplebar>
                                <div class="spl-query">${format(query)}</div>
                            </div>
                            <menu role="list">
                                <li><a href="${search_url}" target="_blank" class="query-search btn-primary"><i class="icon icon-search"></i>Search</a></li>
                                <li><a href="#" class="query-copy btn-primary"><i class="icon icon-copy"></i>Copy</a></li>
                            </menu>
                        </div>
						<p>The filtered search list can be accessed using this link.</p>
						<div class="query-container">    
                            <div class="query-overflow" data-simplebar>
                                <div class="spl-query">${get_filter_link(true)}</div>
                            </div>
                            <menu role="list">
                                <li><a href="${get_filter_link()}" target="_blank" class="btn-primary"><i class="icon icon-external"></i>Open</a></li>
                                <li><a href="#" class="query-copy btn-primary"><i class="icon icon-copy"></i>Copy</a></li>
                            </menu>
                        </div>
                    </section>
                    <section>
                        <h2>Rebuild Search Inventory</h2>
                        <p>Run the <span class="code">Search Inventory - Lookup Gen</span> lookup generation search to re-populate the <span class="code">search_inventory</span> KV store. This automatically occurs once a day by default.</p>
                        <button class="btn-primary btn-rebuild"><i class="icon icon-refresh"></i>Rebuild Search Inventory</button><span class="rebuild-message message"><i class="icon icon-refresh animate-rotate"></i><span> Rebuilding...</span></span>
                    </section>
					<section>
                        <h2>Rebuild Resource Usage Lookup</h2>
                        <p>Run the <span class="code">Search Resource Usage - Lookup Gen</span> lookup generation search to re-populate the <span class="code">sp_search_resource_usage.csv</span> lookup table. This automatically occurs once a day by default.</p>
                        <button class="btn-primary btn-resource"><i class="icon icon-refresh"></i>Rebuild Resource Usage</button><span class="resource-message message"><i class="icon icon-refresh animate-rotate"></i><span> Rebuilding...</span></span>
                    </section>
                </div>
                <div class="modal-footer">
                </div>
            </div>`);

        $('.query-copy', $modal).on('click', function() {
            let search = $('.spl-query', $(this).closest('.query-container')).text(); 
            let $icon = $('i.icon', $(this));
            navigator.clipboard.writeText(search).then(function () {
                $icon.removeClass('icon-copy').addClass('animate-bounce-in icon-check').delay(1000).queue(function() {
                    $icon.removeClass('animate-bounce-in icon-check').addClass('icon-copy').dequeue();
                });
            });
        })

        $('.btn-rebuild', $modal).on('click', function() {
            $('.btn-rebuild').addClass('disabled');
            $('.close', $modal).addClass('disabled');
            $('.modal-backdrop').addClass('disabled');
			$('.rebuild-message i.icon', $modal).removeClass().addClass('icon icon-refresh animate-rotate');
            $('.rebuild-message').removeClass('error').removeClass('success');
			$('.rebuild-message span').text('Rebuilding...');
            $('.rebuild-message', $modal).show();
            
            let $section = $(this).closest('section');
            
            RebuildSM.startSearch();

            RebuildSM.on('search:done search:failed search:error search:canceled', function(e) {
                $('.btn-rebuild').removeClass('disabled');
                $('.close', $modal).removeClass('disabled');
                $('.modal-backdrop').removeClass('disabled');
            });

            RebuildSM.on('search:done', function(e) {
                ContentSM.startSearch();
                $('.rebuild-message i.icon', $modal).removeClass().addClass('icon icon-check');
                $('.rebuild-message').removeClass('error').addClass('success');
                $('.rebuild-message span').text('Complete!');
            });

            RebuildSM.on('search:failed search:error', function(e) {    
                $('.rebuild-message i.icon', $modal).removeClass().addClass('icon icon-error');
                $('.rebuild-message').removeClass('success').addClass('error');
                $('.rebuild-message span').text(e);
            });
        });

		$('.btn-resource', $modal).on('click', function() {
            $('.btn-resource').addClass('disabled');
            $('.close', $modal).addClass('disabled');
            $('.modal-backdrop').addClass('disabled');
			$('.resource-message i.icon', $modal).removeClass().addClass('icon icon-refresh animate-rotate');
            $('.resource-message').removeClass('error').removeClass('success');
			$('.resource-message span').text('Rebuilding...');
            $('.resource-message', $modal).show();
            
            let $section = $(this).closest('section');
            
            ResourceSM.startSearch();

            ResourceSM.on('search:done search:failed search:error search:canceled', function(e) {
                $('.btn-resource').removeClass('disabled');
                $('.close', $modal).removeClass('disabled');
                $('.modal-backdrop').removeClass('disabled');
            });

            ResourceSM.on('search:done', function(e) {
                ContentSM.startSearch();
                $('.resource-message i.icon', $modal).removeClass().addClass('icon icon-check');
                $('.resource-message').removeClass('error').addClass('success');
                $('.resource-message span').text('Complete!');
            });

            ResourceSM.on('search:failed search:error', function(e) {    
                $('.resource-message i.icon', $modal).removeClass().addClass('icon icon-error');
                $('.resource-message').removeClass('success').addClass('error');
                $('.resource-message span').text(e);
            });
        });

		$modal.on('hidden.bs.modal', () => {
			$modal.remove();
		});

		$('body').append($modal);
		$modal.modal('show');
	});

    function multi_handle_all(input) {
        input.on("change", (val) => {
            if (val.length == 0 || (val.length > 1 && val[val.length - 1] == '*')) {
                input.val('*')
            } else if (val.length > 1 && val[0] == '*') {
                input.val(val[1]);
            }

            let $container = $(input.el.closest('.input-container'));
        });
	}

    function create_pagination($container, result_count, current_page) {
		
		$container.html('');

		let count_per_page = 100;
		let page_count = Math.ceil(result_count / count_per_page);

		if (page_count == 1) return;

		let page_list = get_pagination(7, current_page, page_count);

		if (current_page > 1) $container.append(`<li class="pagination-page pagination-prev pagination-clickable"><i class="icon icon-arrow-left right-align"></i></li>`);
		page_list.forEach(function(p) {
			$page = $(`<li class="pagination-page ${(p == current_page) ? 'selected' : ''}">${p}</li>`)
			if (p != '...' && p != current_page) {
                $page.addClass('pagination-clickable');
				$page.attr('data-attr-page', p);
				$page.on('click', function() {
					update_page_offsets(p, count_per_page);
					create_pagination($container, result_count, p);
				});
			}
			$page.appendTo($container);	
		});
		if (current_page < page_count) $container.append(`<li class="pagination-page pagination-next pagination-clickable"><i class="icon icon-arrow-right right-align"></i></li>`);

		$('.pagination-prev', $container).on('click', function() {
			new_page = current_page - 1;
			update_page_offsets(new_page, count_per_page);
			create_pagination($container, result_count, new_page);
		});

		$('.pagination-next', $container).on('click', function() {
			new_page = current_page + 1;
			update_page_offsets(new_page, count_per_page);
			create_pagination($container, result_count, new_page);
		});
	}

    function update_page_offsets(page, count_per_page) {
		let min_offset = (page - 1) * count_per_page;
		let max_offset = page * count_per_page;
		tokens.set("min_offset", min_offset);
		tokens.set("max_offset", max_offset);
	}

    function get_pagination(count, page, total) {
		const start = Math.max (1, Math.min (page - Math.floor ((count - 3) / 2), total - count + 2))
		const end = Math.min (total, Math.max (page + Math.floor ((count - 2) / 2), count - 1))
		return [
			... (start > 2 ? [1, '...'] : start > 1 ? [1] : []), 
			... Array .from ({length: end + 1 - start}, (_, i) => i + start),
			... (end < total - 1 ? ['...', total] : end < total ? [total] : [])
		]
	}

	function update_page_offsets(page, count_per_page) {
		let min_offset = (page - 1) * count_per_page;
		let max_offset = page * count_per_page;
		tokens.set("min_offset", min_offset);
		tokens.set("max_offset", max_offset);
	}

	function get_filter_link(escaped = false) {
		let url = window.location.origin + window.location.pathname + '?'
		let params = [];
		for (input of input_list) {
			let default_val = input.options.default;
			let current_val = input.val();

			if (default_val != current_val) {
				let key = input.options.value.replace(/\$/g, '');
				if (Array.isArray(current_val)) {
					for (val of current_val) {
						params.push(`${key}=${encodeURIComponent(val)}`)
					}
				} else {
					params.push(`${key}=${encodeURIComponent(current_val)}`)
				}
			}
		}
		if (escaped) {
			url += params.join('&amp;');
		} else {
			url += params.join('&');
		}
		return url
	}

});