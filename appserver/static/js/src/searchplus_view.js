define([
	'underscore', 
	'jquery', 
	'splunkjs/mvc/simplesplunkview', 
	'/static/app/searchplus/js/format.min.js',
    '/static/app/searchplus/js/simplebar.min.js'], 
	function (_, $, SimpleSplunkView, format) {

	// Define the custom view class
	var SearchPlusView = SimpleSplunkView.extend({

		className: 'spview',

		// Define our initial values, set the type of results to return
		options: {
			data: 'preview',  // Results type
			outputMode: 'json'
		},

		// Override this method to configure the view
		createView: function () {
			return this;
		},

		formatData: function (data) {
			let rawFields = this.resultsModel.data().fields;
			let objects = _.map(data, function (row) {
				return _.object(rawFields, row);
			});
			return objects
		},

		// Override this method to put the Splunk data into the view
		updateView: function (viz, data) {
			viz.$el.html('');
			data.forEach(function (row) {
                let SEARCH_PREFIX = '/app/searchplus/search?q=search%20';
                let SKIPPED_DRILLDOWN = SEARCH_PREFIX + encodeURIComponent(`index=_internal sourcetype=scheduler status=skipped savedsearch_name="${row.title}"`) + `&earliest=-7d&latest=now`;
                let RUN_TIME_DRILLDOWN = SEARCH_PREFIX + encodeURIComponent(`index=_internal sourcetype=scheduler run_time=* savedsearch_name="${row.title}"`) + `&earliest=-7d&latest=now`;
                let MEM_USED_DRILLDOWN = SEARCH_PREFIX + encodeURIComponent(`index=_introspection sourcetype=splunk_resource_usage data.search_props.sid::* data.search_props.mode!=RT data.search_props.user!="splunk-system-user" data.search_props.label="${row.title}" | rename data.search_props.label as savedsearch_name data.mem_used as mem_used`) + `&earliest=-7d&latest=now`;
                let SCAN_COUNT_DRILLDOWN = SEARCH_PREFIX + encodeURIComponent(`index=_audit sourcetype=audittrail search_id=* action=search savedsearch_name="${row.title}"`) + `&earliest=-7d&latest=now`;
                let RESULT_COUNT_DRILLDOWN = SEARCH_PREFIX + encodeURIComponent(`index=_internal sourcetype=scheduler result_count=* savedsearch_name="${row.title}"`) + `&earliest=-7d&latest=now`;
                let SEARCH_DRILLDOWN = `/app/${row.app}/search?q=${(/^\s*\|/.test(row.search)) ? '' : 'search%20'}${encodeURIComponent(row.search)}&earliest=${row.earliest || '-24h'}&latest=${row.latest || 'now'}`;
                let EDIT_URL = `/manager/searchplus/saved/searches?app=${row.app}&count=10&offset=0&itemType=&owner=${row.owner}&search=%22${encodeURIComponent(row.title)}%22`;
                
                let $markup = $(`
                    <li>
                        <div class="search-header">
                            <div><i class="icon icon-arrow-right"></i></div>
                            <div>${row.title}</div>
                            <div>${row.app}</div>
                            <div>${row.owner}</div>
                            <div>${row.updated}</div>
                            <div>${row.next_scheduled_time}</div>
                            <div>${row.sharing}</div>
                            <div><i class="icon icon-${row.status}"></i>${row.status}</div>
                        </div>
                        <div class="search-details">
                            <div class="nav-container">
                                <nav role="tablist">
                                    <a href="#" aria-controls="general" role="tab" class="selected">General</a>
                                    <a href="#" aria-controls="attributes" role="tab">Attributes</a>
                                    <a href="#" aria-controls="statistics" role="tab">Statistics</a>
                                </nav>
                                <a target="_blank" href="${EDIT_URL}" class="btn-edit-search btn-light"><i class="icon icon-external"></i>Edit Search</a>
                            </div>
                            <div class="search-details-content">
                                <section id="general" role="tabpanel" class="selected">
                                    <div class="query-container">
                                        <div class="query-overflow" data-simplebar>
                                            <div class="spl-query">${format(row.search)}</div>
                                        </div>
                                        <menu role="list">
                                            <li><a href="${SEARCH_DRILLDOWN}" target="_blank" class="query-search btn-primary"><i class="icon icon-search"></i>Search</a></li>
                                            <li><a href="#" class="query-copy btn-primary"><i class="icon icon-copy"></i>Copy</a></li>
                                        </menu>
                                    </div>
                                    <div class="description-container">
                                        <div class="timing-container">
                                            <span class="icon-tag" data-attr-tooltip="Timespan"><i class="icon icon-timespan"></i><span>${row.earliest || 'N/A'} - ${row.latest || 'N/A'}</span></span>
                                            <span class="icon-tag" data-attr-tooltip="Schedule"><i class="icon icon-calendar"></i><span>${row.cron_schedule || 'Not Scheduled'}</span></span>
                                        </div>
                                        <h2>Description</h2>
                                        <p>${row.description || 'No description.'}</p>
                                    </div>
                                </section>
                                <section id="attributes" role="tabpanel" class="hidden">
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-command"></i>Commands</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.command)}</div>
                                    </div>
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-datamodel"></i>Datamodels</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.datamodel)}</div>
                                    </div>
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-field"></i>Fields</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.field)}</div>
                                    </div>
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-function"></i>Functions</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.function)}</div>
                                    </div>
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-index"></i>Indexes</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.index)}</div>
                                    </div>
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-lookup"></i>Lookups</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.lookup)}</div>
                                    </div>
                                    <div>
                                        <div class="attribute-label"><i class="icon icon-macro"></i>Macros</div>
                                        <div class="attribute-container">${viz._makeAttrMarkup(row.macro)}</div>
                                    </div>
                                </section>
                                <section id="statistics" role="tabpanel" class="hidden">
                                    <div class="stat-${row.skipped_status || 'green'}">
                                        <div class="stat-label">Skipped Percent</div>
                                        <div class="stat-value">${row.skipped || 'N/A'}</div>
                                        <a class="stat-drilldown btn-light" target="_blank" href="${SKIPPED_DRILLDOWN}"><i class="icon icon-external right-align"></i></a>
                                    </div>
                                    <div class="stat-${row.run_time_status || 'green'}">
                                        <div class="stat-label">Average Run Time</div>
                                        <div class="stat-value">${row.run_time || 'N/A'}</div>
                                        <a class="stat-drilldown btn-light" target="_blank" href="${RUN_TIME_DRILLDOWN}"><i class="icon icon-external right-align"></i></a>
                                    </div>
                                    <div class="stat-${row.mem_used_status || 'green'}">
                                        <div class="stat-label">Average Memory Used</div>
                                        <div class="stat-value">${row.mem_used || 'N/A'}</div>
                                        <a class="stat-drilldown btn-light" target="_blank" href="${MEM_USED_DRILLDOWN}"><i class="icon icon-external right-align"></i></a>
                                    </div>
                                    <div class="stat-${row.scan_count_status || 'green'}">
                                        <div class="stat-label">Average Events Scanned</div>
                                        <div class="stat-value">${row.scan_count || 'N/A'}</div>
                                        <a class="stat-drilldown btn-light" target="_blank" href="${SCAN_COUNT_DRILLDOWN}"><i class="icon icon-external right-align"></i></a>
                                    </div>
                                    <div class="stat-${row.result_count_status || 'green'}">
                                        <div class="stat-label">Average Result Count</div>
                                        <div class="stat-value">${row.result_count || 'N/A'}</div>
                                        <a class="stat-drilldown btn-light" target="_blank" href="${RESULT_COUNT_DRILLDOWN}"><i class="icon icon-external right-align"></i></a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </li>
                `);

                if (row.correlation_search == 'yes') {
                    $('.search-details nav', $markup).append(`<a href="#" aria-controls="correlation" role="tab">Correlation Search</a>`);
                    $('.search-details-content', $markup).append(`
                        <section id="correlation" role="tabpanel" class="hidden">
                            <div>
                                <div class="attribute-label"><i class="icon icon-correlation"></i>Correlation Details</div>
                                <div class="attribute-container">
                                    <dl><dt>Security Domain:</dt><dd> ${row.security_domain || 'N/A'}</dd></dl>
                                    <dl><dt>Severity:</dt><dd> ${row.severity || 'N/A'}</dd></dl>
                                    <dl><dt>Risk Analysis:</dt><dd> ${row.risk || 'N/A'}</dd></dl>
                                    <dl><dt>Notable Event:</dt><dd> ${row.notable || 'N/A'}</dd></dl>
                                </div>
                            </div>
                            <div>
                                <div class="attribute-label"><i class="icon icon-tactic"></i>MITRE ATT&CK Tactic</div>
                                <div class="attribute-container">${viz._makeAttrMarkup(row.mtr_tactic)}</div>
                            </div>
                            <div>
                                <div class="attribute-label"><i class="icon icon-tactic"></i>MITRE ATT&CK Technique</div>
                                <div class="attribute-container">${viz._makeAttrMarkup(row.mtr_technique)}</div>
                            </div>
                        </section>
                    `);
                }

                //Events
				$('.search-header', $markup).on('click', function () {
					$parent = $(this).parent();
					$('.search-results li.selected').not($parent).removeClass('selected');
					$parent.toggleClass('selected');
				})

                $('.search-details nav a', $markup).on('click', function () {
					if ($(this).hasClass('selected')) return;

					let $container = $(this).closest('.search-details');
					$('nav a.selected', $container).removeClass('selected');
					$(this).addClass('selected');

					let section = $(this).attr('aria-controls');
					$('.search-details-content section', $container).not(`#${section}`).removeClass('selected').addClass('hidden');
					$(`#${section}`, $container).removeClass('hidden').addClass('selected');
				})

                $('.query-copy', $markup).on('click', function() {
					let search = $('.spl-query', $(this).closest('.query-container')).text(); 
					let $icon = $('i.icon', $(this));
					navigator.clipboard.writeText(search).then(function () {
						$icon.removeClass('icon-copy').addClass('animate-bounce-in icon-check').delay(1000).queue(function() {
							$icon.removeClass('animate-bounce-in icon-check').addClass('icon-copy').dequeue();
						});
					});
				})

                viz.$el.append($markup);
			});
		},

        _makeAttrMarkup: function (list) {
			if (!list) return '';
			if (!Array.isArray(list)) list = [list];
			let markup = '';

            list.forEach(e => {
                if (e == 'N/A' || e == '') return;
                markup += `<span class="tag">${e}</span>`
            })	
			return markup;
		}
	});

	return SearchPlusView;

});


