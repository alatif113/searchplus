const { parseJSON } = require('jquery');

define(function (require, exports, module) {

	var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
	var _ = require("underscore");
	var $ = require("jquery");
	var format = require("/static/app/searchplus/js/format.js");
	require("/static/app/searchplus/js/searchplus_icons.js")

	// Define the custom view class
	var SearchPlusView = SimpleSplunkView.extend({

		className: "spview",

		// Define our initial values, set the type of results to return
		options: {
			data: "preview",  // Results type
			outputMode: "json"
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
				var search_url = '/app/' + row.app + '/search?q=' + ((/^\s*\|/.test(row.search)) ? '' : 'search%20') + encodeURIComponent(row.search) + "&earliest=" + (row.earliest || '-24h') + "&latest=" + (row.latest || 'now');
				var edit_url = '/manager/searchplus/saved/searches?app=' + row.app + '&count=10&offset=0&itemType=&owner=' + row.owner + '&search=%22' + encodeURIComponent(row.title) + '%22';
				var $markup = $(`
				<div class="sp-search-row">
					<div class="sp-search sp-clickable sp-flex-container">
						<div class="sp-search-col sp-search-dropdown sp-flex-container">
							<svg class="sp-icon" width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9 6L15 12L9 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<div class="sp-search-col sp-search-label">${row.title}</div>
						<div class="sp-search-col sp-search-app">${row.app}</div>
						<div class="sp-search-col sp-search-owner">${row.owner}</div>
						<div class="sp-search-col sp-search-updated">${row.updated}</div>
						<div class="sp-search-col sp-search-updated">${row.next_scheduled_time}</div>
						<div class="sp-search-col sp-search-updated">${row.sharing}</div>
						<div class="sp-search-col sp-search-status"><span class="sp-search-status-${row.status}">${row.status}</span></div>
					</div>
					<div class="sp-search-details">
						<div class="sp-search-details-nav sp-flex-container">
							<div class="sp-nav-item sp-clickable selected" data-attr-section="general">General</div>
							<div class="sp-nav-item sp-clickable" data-attr-section="attributes">Attributes</div>
						</div>
						<div class="sp-nav-section sp-nav-section-general sp-flex-container" data-attr-section="general">
							<div class="sp-query-container sp-card">
								<div class="sp-query-overflow">
									<div class="sp-search-query">${format(row.search, true, true)}</div>
								</div>
								<div class="sp-query-controls-container sp-flex-container">
									<a href="${search_url}" target="_blank" class="sp-query-control sp-query-control-search sp-flex-container">${icon_search}<span>Search</span></a>
									<a class="sp-query-control sp-query-control-copy sp-flex-container">${icon_copy}<span>Copy</span></a>
									<a href="${edit_url}" target="_blank" class="sp-query-control sp-query-control-edit sp-flex-container">${icon_edit}<span>Edit</span></a>
								</div>
							</div>
							<div class="sp-search-desc">
								<div class="sp-search-timing">
									<span><span class="sp-bold">Timespan:</span><span class="sp-mono"> ${row.earliest || 'N/A'} - ${row.latest || 'N/A'}</span></span>
									<span><span class="sp-bold">Schedule:</span><span class="sp-mono"> ${row.cron_schedule || 'Not Scheduled'}</span></span>
								</div>
								<div class="sp-search-desc-text">
									<div class="sp-search-desc-value">${row.description || 'No description.'}</div>
								</div>
							</div>
						</div>
						<div class="sp-nav-section sp-nav-section-attributes sp-flex-container" data-attr-section="attributes" style="display: none;">
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_commands}<span>Commands</span></div>
								<div class="sp-attribute sp-attribute-1">${viz._makeAttrMarkup(row.command)}</div>
							</div>
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_datamodels}<span>Datamodels</span></div>
								<div class="sp-attribute sp-attribute-2">${viz._makeAttrMarkup(row.datamodel)}</div>
							</div>
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_fields}<span>Fields</span></div>
								<div class="sp-attribute sp-attribute-3">${viz._makeAttrMarkup(row.field)}</div>
							</div>
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_functions}<span>Functions</span></div>
								<div class="sp-attribute sp-attribute-4">${viz._makeAttrMarkup(row.function)}</div>
							</div>
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_indexes}<span>Indexes</span></div>
								<div class="sp-attribute sp-attribute-5">${viz._makeAttrMarkup(row.index)}</div>
							</div>
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_lookups}<span>Lookups</span></div>
								<div class="sp-attribute sp-attribute-6">${viz._makeAttrMarkup(row.lookup)}</div>
							</div>
							<div class="sp-attribute-container">
								<div class="sp-attribute-label">${icon_macros}<span>Macros</span></div>
								<div class="sp-attribute sp-attribute-7">${viz._makeAttrMarkup(row.macro)}</div>
							</div>
						</div>
					</div>
				</div>
				`);

				if (row.correlation_search == 'yes') {
					$('.sp-search-details-nav', $markup).append(`
						<div class="sp-nav-item sp-clickable" data-attr-section="correlation">Correlation Search</div>
					`);

					$('.sp-search-details', $markup).append(`
					<div class="sp-nav-section sp-nav-section-correlation sp-flex-container" data-attr-section="correlation" style="display: none;">
						<div class="sp-attribute-container">
							<dl class="sp-list-dotted"><dt class="sp-bold">Security Domain:</dt><dd> ${row.security_domain || 'N/A'}</dd></dl>
							<dl class="sp-list-dotted"><dt class="sp-bold">Severity:</dt><dd class="sp-severity sp-severity-${row.severity || 'na'}"> ${row.severity || 'N/A'}</dd></dl>
							<dl class="sp-list-dotted"><dt class="sp-bold">Risk Analysis:</dt><dd> ${row.risk || 'N/A'}</dd></dl>
							<dl class="sp-list-dotted"><dt class="sp-bold">Notable Event:</dt><dd> ${row.notable || 'N/A'}</dd></dl>
						</div>
						<div class="sp-attribute-container">
							<div class="sp-attribute-label">${icon_tactics}<span>MITRE ATT&CK Tactics</span></div>
							<div class="sp-attribute sp-attribute-1">${viz._makeAttrMarkup(row.mtr_tactic)}</div>
						</div>
						<div class="sp-attribute-container">
							<div class="sp-attribute-label">${icon_techniques}<span>MITRE ATT&CK Techniques</span></div>
							<div class="sp-attribute sp-attribute-2">${viz._makeAttrMarkup(row.mtr_technique)}</div>
						</div>
					</div>
					`);
				}

				//Events
				$('.sp-search', $markup).on('click', function () {
					$parent = $(this).parent();
					$('.sp-search-row.selected').not($parent).removeClass('selected');
					$parent.toggleClass('selected');
				})

				$('.sp-nav-item', $markup).on('click', function () {
					if ($(this).hasClass('selected')) return;

					let $container = $(this).closest('.sp-search-details');
					$('.sp-nav-item.selected', $container).removeClass('selected');
					$(this).addClass('selected');

					let section = $(this).attr('data-attr-section');
					console.log(section);
					$('.sp-nav-section', $container).not(`[data-attr-section="${section}"]`).hide();
					$(`.sp-nav-section[data-attr-section="${section}"]`, $container).show();

				})

				$('.sp-query-control-copy', $markup).on('click', function() {
					let search = $('.sp-search-query', $(this).closest('.sp-query-container')).text(); 
					let $that = $(this);
					navigator.clipboard.writeText(search).then(function () {
						$that.addClass('animate-copied').html(`${icon_check} <span>Copy</span>`).delay(1000).queue(function() {
							$that.removeClass('animate-copied').html(`${icon_copy} <span>Copy</span>`).dequeue();
						});
					}, function () {
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
				markup += `<span class="sp-tag" title="${e}">${e}</span>`
			})

			return markup;
		}
	});

	return SearchPlusView;

});


