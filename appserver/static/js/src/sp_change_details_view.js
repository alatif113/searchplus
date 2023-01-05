define([
	'underscore', 
	'jquery', 
	'splunkjs/mvc/simplesplunkview',
	'/static/app/searchplus/js/htmldiff.min.js', 
	'/static/app/searchplus/js/format.min.js',
    '/static/app/searchplus/js/simplebar.min.js'], 
	function (_, $, SimpleSplunkView, htmldiff, format) {

	// Define the custom view class
	var SPChangeDetailsView = SimpleSplunkView.extend({

		className: 'sp-change-details-view',

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
                
				let fields = {
					app: {
						label: 'App',
						icon: 'icon-folder'
					}, 
					correlation_search: {
						label: 'Correlation Search',
						icon: 'icon-correlation'
					},
					cron_schedule: {
						label: 'Cron Schedule',
						icon: 'icon-calendar'
					},
					description: {
						label: 'Description',
						icon: 'icon-description'
					},
					earliest: {
						label: 'Earliest',
						icon: 'icon-timer'
					},
					latest: {
						label: 'Latest',
						icon: 'icon-timer'
					},
					mtr_tactic: {
						label: 'MITRE Tactic',
						icon: 'icon-tactic'
					},
					mtr_technique: {
						label: 'MITRE Technique',
						icon: 'icon-technique'
					},
					notable: {
						label: 'Notable',
						icon: 'icon-notable',
					},
					owner: {
						label: 'Owner',
						icon: 'icon-user'
					},
					risk: {
						label: 'Risk',
						icon: 'icon-risk'
					},
					search: {
						label: 'Search',
						icon: 'icon-search'
					},
					security_domain: {
						label: 'Security Domain',
						icon: 'icon-securitydomain'
					},
					severity: {
						label: 'Severity',
						icon: 'icon-severity'
					},
					sharing: {
						label: 'Sharing',
						icon: 'icon-share'
					},
					status: {
						label: 'Status',
						icon: 'icon-toggle'
					},
					updated: {
						label: 'Updated',
						icon: 'icon-clock'
					}
				}

				viz.$el.append($(`
					<li class="change-list-item">
						<div>${row.title}</div>
					</li>
				`));


				Object.keys(fields).forEach(field => {
					let curr_field = row[field] || '';
					let prev_field = row['prev_'+field] || '';

					if (field == 'search') {
						curr_field = format(curr_field);
						prev_field = format(prev_field);
						viz.$el.append($(`
							<li class="change-list-item">
								<div><i class="icon ${fields[field].icon}"></i>${fields[field].label}</div>
								<div>
									<div class="query-container">
										<div class="query-overflow" data-simplebar>
											<div class="spl-query">${curr_field}</div>
										</div>
									</div>
								</div>
								<div>
									<div class="query-container">
										<div class="query-overflow" data-simplebar>
											<div class="spl-query">${htmldiff(prev_field, curr_field)}</div>
										</div>
									</div>
								</div>
							</li>
						`));
					} else {
						viz.$el.append($(`
							<li class="change-list-item">
								<div><i class="icon ${fields[field].icon}"></i>${fields[field].label}</div>
								<div>${curr_field}</div>
								<div class="sp-diff">${htmldiff(prev_field, curr_field)}</div>
							</li>
						`));
					}
				});
			});
		},
	});

	return SPChangeDetailsView;

});


