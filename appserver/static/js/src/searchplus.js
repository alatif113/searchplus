require([
    'jquery',
	'splunkjs/mvc',
	'splunkjs/mvc/searchmanager',
	'splunkjs/mvc/savedsearchmanager',
	"splunkjs/mvc/postprocessmanager",
	'splunkjs/mvc/simpleform/input/text',
	'splunkjs/mvc/simpleform/input/multiselect',
	'splunkjs/mvc/timerangeview',
	"splunkjs/mvc/dropdownview",
	'/static/app/searchplus/js/searchplus_view.min.js',
	'/static/app/searchplus/js/format.min.js', 
	"/static/app/searchplus/js/searchplus_icons.min.js"
], function($, mvc, SearchManager, SavedSearchManager, PostProcessManager, TextInput, MultiSelectInput, TimeRangeView, DropdownView, SearchPlusView, format) {

	$dashboard = $('.dashboard-body').html(`
		<div class="sp-view sp-flex-container">
			<div class="sp-filter-container">
				<div class="sp-settings-container">
					<div class="sp-settings sp-clickable">
						${icon_settings}
					</div>
					<div class="sp-settings-menu">
						<div class="sp-settings-item sp-clickable sp-settings-view-search">View Filtered Search</div>
						<div class="sp-settings-item sp-clickable sp-settings-rebuild">Rebuild Search Inventory</div>
					</div>
				</div>
				<div class="sp-result-count sp-flex-container">${icon_filter}<span class="sp-result-count-value">0</span> Matched Searches</div>
				<div class="sp-filter">
					<div class="sp-input-group">
						<div class="sp-input-group-label sp-flex-container">
							<span>General Filters</span>
							<span class="sp-filter-toggle sp-clickable sp-filter-toggle-minus">${icon_minus}</span>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_sort}<span>Sort By</span></div>
							<div class="sp-filter-sort sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_updated}<span>Last Updated</span></div>
							<div class="sp-filter-updated sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_search}<span>Search</span></div>
							<div class="sp-filter-keyword sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_app}<span>App</span></div>
							<div class="sp-filter-app sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_owner}<span>Owner</span></div>
							<div class="sp-filter-owner sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_status}<span>Status</span></div>
							<div class="sp-filter-status sp-input"></div>
						</div>
					</div>
					<div class="sp-input-group">
						<div class="sp-input-group-label sp-flex-container">
							<span>Attribute Filters</span>
							<span class="sp-filter-toggle sp-clickable sp-filter-toggle-minus">${icon_minus}</span>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_commands}<span>Commands</span></div>
							<div class="sp-filter-command sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_datamodels}<span>Datamodels</span></div>
							<div class="sp-filter-datamodel sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_fields}<span>Fields</span></div>
							<div class="sp-filter-field sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_functions}<span>Functions</span></div>
							<div class="sp-filter-function sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_indexes}<span>Indexes</span></div>
							<div class="sp-filter-index sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_lookups}<span>Lookups</span></div>
							<div class="sp-filter-lookup sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_macros}<span>Macros</span></div>
							<div class="sp-filter-macro sp-input"></div>
						</div>
					</div>
					<div class="sp-input-group">
						<div class="sp-input-group-label sp-flex-container">
							<span>Correlation Serach Filters</span>
							<span class="sp-filter-toggle sp-clickable sp-filter-toggle-minus">${icon_minus}</span>						
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_shield}<span>Correlation Search</span></div>
							<div class="sp-filter-correlation sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_label}<span>Security Domain</span></div>
							<div class="sp-filter-domain sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_severity}<span>Severity</span></div>
							<div class="sp-filter-severity sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_tactics}<span>MITRE ATT&CK Tactic</span></div>
							<div class="sp-filter-mtr-tactic sp-input"></div>
						</div>
						<div class="sp-input-container">
							<div class="sp-input-label sp-flex-container">${icon_techniques}<span>MITRE ATT&CK Technique</span></div>
							<div class="sp-filter-mtr-technique sp-input"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="sp-search-container">
				<div class="sp-search-header sp-search-row sp-flex-container">
					<div class="sp-search-col"></div>
					<div class="sp-search-col sp-flex-container">${icon_searchname}<span>Title</span></div>
					<div class="sp-search-col sp-flex-container">${icon_app}<span>App</span></div>
					<div class="sp-search-col sp-flex-container">${icon_owner}<span>Owner</span></div>
					<div class="sp-search-col sp-flex-container">${icon_updated}<span>Updated</span></div>
					<div class="sp-search-col sp-flex-container">${icon_nextschedule}<span>Next Scheduled Time</span></div>
					<div class="sp-search-col sp-flex-container">${icon_share}<span>Sharing</span></div>
					<div class="sp-search-col sp-flex-container">${icon_status}<span>Status</span></div>
				</div>
				<div class="sp-search-list">
				</div>
				<div class="sp-pagination-container">
					<div class="sp-pagination"></div>
				</div>
			</div>
		</div>
	`);

	// ----------------------------------------------
	// Base Search Manager
	// ----------------------------------------------
	let tokens = mvc.Components.get("default");

	new SearchManager({
		id: "sm_base",
		data: 'results',
		preview: true,
		cache: true,
		earliest_time: 0,
		latest_time: 'now',
		search: `| inputlookup sp_search_inventory where (title="*$keyword$*" OR description="*$keyword$*") status=$status$
		| where _time >= coalesce(relative_time(now(), "$updated$"), 0)
		| foreach command datamodel field index macro lookup function mtr_tactic mtr_technique
			[eval <<FIELD>>=split(<<FIELD>>, "|")]
		| foreach command datamodel field index macro lookup function
			[eval <<FIELD>>=lower(<<FIELD>>)]`
	}, { tokens: true });

	// ----------------------------------------------
	// Main View
	// ----------------------------------------------
	var SearchListManager = new SearchManager({
		id: "sm_searchlist",
		data: 'results',
		preview: true,
		cache: true,
		earliest_time: 0,
		latest_time: 'now',
		search: `| inputlookup sp_search_inventory where (title="*$keyword$*" OR description="*$keyword$*") status=$status$
	| where _time >= coalesce(relative_time(now(), "$updated$"), 0)
	| foreach command datamodel field index macro lookup function mtr_tactic mtr_technique
		[eval <<FIELD>>=lower(split(<<FIELD>>, "|"))]
	| fillnull command datamodel field index macro lookup function mtr_tactic mtr_technique security_domain severity value="N/A"
	| search correlation_search=$correlation$ security_domain IN ($domain$) severity IN ($severity$) field IN ($field$) app IN ($app$) owner IN ($owner$) command IN ($command$) datamodel IN ($datamodel$) index IN ($index$) macro IN ($macro$) lookup IN ($lookup$) function IN ($function$) mtr_tactic IN ($tactic$) mtr_technique IN ($technique$)
	| join type=left title [| inputlookup sp_search_resource_usage.csv]
	| fillnull skipped run_time result_count mem_used scan_count value="N/A"
	| sort $sort$`
	}, { tokens: true });

	// ----------------------------------------------
	// Pagination
	// ----------------------------------------------

	update_page_offsets(1, 100);

	var PaginationManager = new PostProcessManager({
		id: "ppm_pagination",
		manager: "sm_searchlist",
		data: 'results',
		preview: true,
		cache: true,
		search: `| streamstats count
	| search count > $min_offset$  count <= $max_offset$`
	}, { tokens: true });

	var SearchPlusView = new SearchPlusView({
		id: "sp_view",
		managerid: "ppm_pagination",
		el: $('.dashboard-body .sp-search-list')
	}).render();

	// ----------------------------------------------
	// Updated Filter
	// ----------------------------------------------
	var UpdatedFilter = new DropdownView({
		id: "sp_filter_updated",
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
        el: $('.sp-filter-updated')
    }, {tokens: true}).render();

	// ----------------------------------------------
	// Sort Filter
	// ----------------------------------------------
	var SortFilter = new DropdownView({
		id: "sp_filter_sort",
		choices: [{label: "Title", value: "title"}, {label: "App", value: "app"}, {label: "Owner", value: "owner"}, {label: "Updated", value: "updated"}, {label: "Next Scheduled Time", value: "next_scheduled"}, {label: "Sharing", value: "sharing"}, {label: "Status", value: "status"}],
        default: "title",
		value: "$sort$",
        el: $('.sp-filter-sort')
    }, {tokens: true}).render();

	// ----------------------------------------------
	// Keyword Filter
	// ----------------------------------------------
	var KeywordFilter = new TextInput({
		id: "sp_filter_keyword",
		default: "",
		value: "$keyword$",
		el: $('.sp-filter-keyword')
	}, {tokens: true}).render();

	// ----------------------------------------------
	// App Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_app",
		managerid: "sm_base",
		search: '| table app | dedup app | sort app'
	});

	var AppFilter = new MultiSelectInput({
		id: "sp_filter_app",
		choices: [{label: "All", value: "*"}],
		managerid: "ppm_app",
		labelField: "app",
		valueField: "app",
		value: "$app$",
		el: $('.sp-filter-app')
	}, {tokens: true}).render();

	multi_handle_all(AppFilter);

	// ----------------------------------------------
	// Owner Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_owner",
		managerid: "sm_base",
		search: '| stats count by owner | sort owner'
	});

	var OwnerFilter = new MultiSelectInput({
		id: "sp_filter_owner",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_owner",
		labelField: "owner",
		valueField: "owner",
		value: "$owner$",
		el: $('.sp-filter-owner')
	}, {tokens: true}).render();

	multi_handle_all(OwnerFilter);

	// ----------------------------------------------
	// Status Filter
	// ----------------------------------------------
	var StatusFilter = new DropdownView({
		id: "sp_filter_status",
		choices: [{label: "All", value: "*"}, {label: "Enabled", value: "Enabled"}, {label: "Disabled", value: "Disabled"}],
        default: "*",
		value: "$status$",
        el: $('.sp-filter-status')
	}, {tokens: true}).render();

	// ----------------------------------------------
	// Command Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_command",
		managerid: "sm_base",
		search: '| stats count by command | sort command'
	});

	var CommandFilter = new MultiSelectInput({
		id: "sp_filter_command",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_command",
		valuePrefix: "command=",
		delimeter: " OR ",
		labelField: "command",
		valueField: "command",
		value: "$command$",
		el: $('.sp-filter-command')
	}, {tokens: true}).render();

	multi_handle_all(CommandFilter);

	// ----------------------------------------------
	// Datamodel Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_datamodel",
		managerid: "sm_base",
		search: '| stats count by datamodel | sort datamodel'
	});

	var DatamodelFilter = new MultiSelectInput({
		id: "sp_filter_datamodel",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_datamodel",
		labelField: "datamodel",
		valueField: "datamodel",
		value: "$datamodel$",
		el: $('.sp-filter-datamodel')
	}, {tokens: true}).render();

	multi_handle_all(DatamodelFilter);

	// ----------------------------------------------
	// Field Filter
	// ----------------------------------------------
	var FieldFilter = new MultiSelectInput({
		id: "sp_filter_field",
		allowCustomValues: true,
		choices: [{label: "All", value: "*"}],
		default: "*",
		value: "$field$",
		el: $('.sp-filter-field')
	}, {tokens: true}).render();

	multi_handle_all(FieldFilter);

	// ----------------------------------------------
	// Function Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_function",
		managerid: "sm_base",
		search: '| stats count by function | sort function'
	});

	var FunctionFilter = new MultiSelectInput({
		id: "sp_filter_function",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_function",
		labelField: "function",
		valueField: "function",
		value: "$function$",
		el: $('.sp-filter-function')
	}, {tokens: true}).render();

	multi_handle_all(FunctionFilter);

	// ----------------------------------------------
	// Index Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_index",
		managerid: "sm_base",
		search: '| stats count by index | sort index'
	});

	var IndexFilter = new MultiSelectInput({
		id: "sp_filter_index",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_index",
		labelField: "index",
		valueField: "index",
		value: "$index$",
		el: $('.sp-filter-index')
	}, {tokens: true}).render();

	multi_handle_all(IndexFilter);

	// ----------------------------------------------
	// Lookup Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_lookup",
		managerid: "sm_base",
		search: '| stats count by lookup | sort lookup'
	});

	var LookupFilter = new MultiSelectInput({
		id: "sp_filter_lookup",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_lookup",
		labelField: "lookup",
		valueField: "lookup",
		value: "$lookup$",
		el: $('.sp-filter-lookup')
	}, {tokens: true}).render();

	multi_handle_all(LookupFilter);

	// ----------------------------------------------
	// Macro Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_macro",
		managerid: "sm_base",
		search: '| stats count by macro | sort macro'
	});

	var MacroFilter = new MultiSelectInput({
		id: "sp_filter_macro",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_macro",
		labelField: "macro",
		valueField: "macro",
		value: "$macro$",
		el: $('.sp-filter-macro')
	}, {tokens: true}).render();

	multi_handle_all(MacroFilter);

	// ----------------------------------------------
	// Correlation Search Filter
	// ----------------------------------------------
	var CorrelationFilter = new DropdownView({
		id: "sp_filter_correlation",
		choices: [{label: "All", value: "*"}, {label: "Yes", value: "yes"}, {label: "No", value: "no"}],
        default: "*",
		value: "$correlation$",
        el: $('.sp-filter-correlation')
	}, {tokens: true}).render();

	// ----------------------------------------------
	// Severity Filter
	// ----------------------------------------------
	var SeverityFilter = new MultiSelectInput({
		id: "sp_filter_severity",
		choices: [{label: "All", value: "*"}, {label: "Critical", value: "critical"}, {label: "High", value: "high"}, {label: "Medium", value: "medium"}, {label: "Low", value: "low"}, {label: "Informational", value: "informational"}],
		default: "*",
		value: "$severity$",
		el: $('.sp-filter-severity')
	}, {tokens: true}).render();

	multi_handle_all(SeverityFilter);

	// ----------------------------------------------
	// Security Domain Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_domain",
		managerid: "sm_base",
		search: '| stats count by security_domain | sort security_domain'
	});

	var DomainFilter = new MultiSelectInput({
		id: "sp_filter_domain",
		choices: [{label: "All", value: "*"}],
		default: "*",
		value: "$domain$",
		managerid: "ppm_domain",
		labelField: "security_domain",
		valueField: "security_domain",
		el: $('.sp-filter-domain')
	}, {tokens: true}).render();

	multi_handle_all(DomainFilter);

	// ----------------------------------------------
	// Tactic Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_tactic",
		managerid: "sm_base",
		search: '| stats count by mtr_tactic | sort mtr_tactic | eval mtr_tactic_quoted="\\"".mtr_tactic."\\""'
	});

	var TacticFilter = new MultiSelectInput({
		id: "sp_filter_tactic",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_tactic",
		labelField: "mtr_tactic",
		valueField: "mtr_tactic_quoted",
		value: "$tactic$",
		el: $('.sp-filter-mtr-tactic')
	}, {tokens: true}).render();

	multi_handle_all(TacticFilter);

	// ----------------------------------------------
	// Technique Filter
	// ----------------------------------------------
	new PostProcessManager({
		id: "ppm_technique",
		managerid: "sm_base",
		search: '| stats count by mtr_technique | sort mtr_technique | eval mtr_technique_quoted="\\"".mtr_technique."\\""'
	});

	var TechniqueFilter = new MultiSelectInput({
		id: "sp_filter_techniuqe",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_technique",
		labelField: "mtr_technique",
		valueField: "mtr_technique_quoted",
		value: "$technique$",
		el: $('.sp-filter-mtr-technique')
	}, {tokens: true}).render();

	multi_handle_all(TechniqueFilter);

	// ----------------------------------------------
	// Events
	// ----------------------------------------------
	SearchListManager.on('search:done', function(e) {
		let results = this.data('results');
		let result_count = results.attributes.manager.attributes.data.resultCount;
		$('.sp-result-count-value', $dashboard).html(result_count);

		let $pagination = $('.sp-pagination', $dashboard);
		create_pagination($pagination, result_count, 1);
	});

	PaginationManager.on('search:done', function(e) {
		console.log(this.query.attributes.search);
	});

	$('.sp-input-group').each(function() { 			
		update_filter_height($(this));	
	});

	$('.sp-filter-toggle').on('click', function() {
		$(this).closest('.sp-input-group').toggleClass('closed');
		if ($(this).hasClass('sp-filter-toggle-minus')) {
			$(this).html(icon_plus)
			$(this).removeClass('sp-filter-toggle-minus').addClass('sp-filter-toggle-plus')
		} else if ($(this).hasClass('sp-filter-toggle-plus')) {
			$(this).html(icon_minus)
			$(this).removeClass('sp-filter-toggle-plus').addClass('sp-filter-toggle-minus')
		}
	});

	$('.sp-filter-container').click(function() {
		$('.sp-settings-menu').hide();
	});

	$('.sp-settings').on('click', function(e) {
		e.stopPropagation();
		$('.sp-settings-menu').toggle();
	})

	$('.sp-settings-view-search').on('click', function(e) {
		let query = SearchListManager.query.attributes.search;
		let search_url = '/app/searchplus/search?q=' + encodeURIComponent(query);
		let $modal = $(`
		<div class="modal fade modal-wide">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h3>Filtered Search Inventory</h3>
			</div>
			<div class="modal-body">
				<div class="sp-query-overflow">
					<div class="sp-search-query">${format(query, true, true)}</div>
				</div>
			</div>
			<div class="modal-footer">
				<a href="#" data-dismiss="modal" class="btn">Cancel</a>
				<a href="${search_url}" target="_blank" class="btn btn-primary">Run in Search</a>
			</div>
		</div>`);

		$modal.on('hidden.bs.modal', () => {
			$modal.remove();
		});

		$('body').append($modal);
		$modal.modal('show');
	});

	let BuildInventoryManager = new SavedSearchManager({
		id: "build_inventory_ssm",
		searchname: "Search Inventory - Lookup Gen",
		preview: true,
		"dispatch.earliest_time": "0",
		"dispatch.latest_time": "now",
		app: "searchplus",
		autostart: false
	});

	$('.sp-settings-rebuild').on('click', function(e) {
		let $modal = $(`
		<div class="modal fade" data-backdrop="static">
			<div class="modal-header">
				<span class="sp-loader"></span> Rebuilding Search Inventory ...
			</div>
		</div>`);

		$modal.on('hidden.bs.modal', () => {
			$modal.remove();
		});

		$('body').append($modal);
		$modal.modal('show');

		BuildInventoryManager.startSearch();
		BuildInventoryManager.on('search:progress', function(e) {
			console.log(e);
		});
		BuildInventoryManager.on('search:done', function(e) {
			$modal.modal('hide');
			SearchListManager.startSearch();
		});
		BuildInventoryManager.on('search:failed search:error', function(e) {
			$('.modal-header').html(`<h3>${icon_alert} Error</h3>`);

			$modal.append(`
				<div class="modal-body">${e}</div>
				<div class="modal-footer">
					<a href="#" data-dismiss="modal" class="btn">Close</a>
				</div>
			`);
		});
	});

	// ----------------------------------------------
	// Functions
	// ----------------------------------------------

	function update_filter_height($container) {
		$container.css('height', 'auto');
		let height = $container.prop('scrollHeight');
		$container.css('height', height + 'px');
	}

	function multi_handle_all(multi) {
		multi.on("change", (val) => {
			if (val.length == 0 || (val.length > 1 && val[val.length - 1] == '*')) {
				multi.val('*')
			} else if (val.length > 1 && val[0] == '*') {
				multi.val(val[1]);
			}

			let $container = $(multi.el.closest('.sp-input-group'));
			update_filter_height($container);
		});
	}

	function create_pagination($container, result_count, current_page) {
		
		$container.html('');

		let count_per_page = 100;
		let page_count = Math.ceil(result_count / count_per_page);

		if (page_count == 1) return;

		let page_list = get_pagination(7, current_page, page_count);

		if (current_page > 1) $container.append(`<div class="sp-page sp-page-prev sp-clickable">${icon_arrow_left}</div>`);
		page_list.forEach(function(p) {
			$page = $(`<div class="sp-page ${(p == current_page) ? 'selected' : ''}">${p}</div>`)
			if (p != '...' && p != current_page) {
				$page.addClass('sp-clickable');
				$page.attr('data-attr-page', p);
				$page.on('click', function() {
					update_page_offsets(p, count_per_page);
					create_pagination($container, result_count, p);
				});
			}
			$page.appendTo($container);	
		});
		if (current_page < page_count) $container.append(`<div class="sp-page sp-page-next sp-clickable">${icon_arrow_right}</div>`);

		$('.sp-page-prev', $container).on('click', function() {
			new_page = current_page - 1;
			update_page_offsets(new_page, count_per_page);
			create_pagination($container, result_count, new_page);
		});

		$('.sp-page-next', $container).on('click', function() {
			new_page = current_page + 1;
			update_page_offsets(new_page, count_per_page);
			create_pagination($container, result_count, new_page);
		});
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
});

