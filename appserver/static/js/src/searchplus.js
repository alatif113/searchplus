require([
    'jquery',
	'splunkjs/mvc',
	'splunkjs/mvc/searchmanager',
	"splunkjs/mvc/postprocessmanager",
	'splunkjs/mvc/simpleform/input/text',
	'splunkjs/mvc/simpleform/input/multiselect',
	'splunkjs/mvc/timerangeview',
	"splunkjs/mvc/dropdownview",
	'/static/app/searchplus/js/searchplus_view.min.js',
	"/static/app/searchplus/js/searchplus_icons.min.js"
], function($, mvc, SearchManager, PostProcessManager, TextInput, MultiSelectInput, TimeRangeView, DropdownView, SearchPlusView) {

	$dashboard = $('.dashboard-body').html(`
		<div class="sp-view sp-flex-container">
			<div class="sp-filter-container">
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
							<div class="sp-filter-timerange sp-input"></div>
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
			</div>
		</div>
	`);

	// ----------------------------------------------
	// Base Search Manager
	// ----------------------------------------------
	new SearchManager({
		id: "sm_base",
		data: 'results',
		preview: true,
		cache: true,
		search: `| inputlookup search_decomposition.csv where (title="*$keyword$*" OR description="*$keyword$*") status=$status$
		| foreach command datamodel field index macro lookup function mtr_tactic mtr_technique
			[eval <<FIELD>>=split(<<FIELD>>, "|")]
		| foreach command datamodel field index macro lookup function
			[eval <<FIELD>>=lower(<<FIELD>>)]`
	}, { tokens: true });

	// ----------------------------------------------
	// Main View
	// ----------------------------------------------
	var SearchListManager = new SearchManager({
		id: "ppm_searchlist",
		data: 'results',
		preview: true,
		cache: true,
		search: `| inputlookup search_decomposition.csv where (title="*$keyword$*" OR description="*$keyword$*") status=$status$
		| foreach command datamodel field index macro lookup function mtr_tactic mtr_technique
			[eval <<FIELD>>=lower(split(<<FIELD>>, "|"))]
		| fillnull command datamodel field index macro lookup function mtr_tactic mtr_technique value="N/A"
		| search field IN ($field$) app IN ($app$) owner IN ($owner$) command IN ($command$) datamodel IN ($datamodel$) index IN ($index$) macro IN ($macro$) lookup IN ($lookup$) function IN ($function$) mtr_tactic IN ($tactic$) mtr_technique IN ($technique$)
		| sort $sort$`
	}, { tokens: true });

	var SearchListManager2 = new PostProcessManager({
		id: "ppm_searchlist2",
		manager: "ppm_searchlist",
		data: 'results',
		preview: true,
		cache: true,
		search: `| streamstats count
		| search count > 0  count <= 100 `
	}, { tokens: true });

	var SearchPlusView = new SearchPlusView({
		id: "sp_view",
		managerid: "ppm_searchlist2",
		el: $('.dashboard-body .sp-search-list')
	}).render();

	// ----------------------------------------------
	// Time Range Filter
	// ----------------------------------------------
	var TimeRangeView = new TimeRangeView({
		id: "sp_filter_timerange",
        preset: "All Time",
        el: $(".sp-filter-timerange")
	}).render();

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
		search: '| stats count by mtr_tactic | sort mtr_tactic'
	});

	var TacticFilter = new MultiSelectInput({
		id: "sp_filter_tactic",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_tactic",
		labelField: "mtr_tactic",
		valueField: "mtr_tactic",
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
		search: '| stats count by mtr_technique | sort mtr_technique'
	});

	var TechniqueFilter = new MultiSelectInput({
		id: "sp_filter_techniuqe",
		choices: [{label: "All", value: "*"}],
		default: "*",
		managerid: "ppm_technique",
		labelField: "mtr_technique",
		valueField: "mtr_technique",
		value: "$technique$",
		el: $('.sp-filter-mtr-technique')
	}, {tokens: true}).render();

	multi_handle_all(TechniqueFilter);

	// ----------------------------------------------
	// Events
	// ----------------------------------------------
	SearchListManager.on('search:done', function(e) {
		console.log(this.query.attributes.search);
		let results = this.data('results');
		let count = results.attributes.manager.attributes.data.resultCount;
		$('.sp-result-count-value', $dashboard).html(count);
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
});

