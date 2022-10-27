define([
	'underscore', 
	'jquery', 
	'splunkjs/mvc/simplesplunkview', 
    '/static/app/searchplus/js/simplebar.min.js'], 
	function (_, $, SimpleSplunkView, format) {

	// Define the custom view class
	var SPChangeView = SimpleSplunkView.extend({

		className: 'sp-change-view',

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
                console.log(row)
                let $markup = $(`
                    <li>
                        <div class="search-title">${row.title}</div>
                        <div class="change-time">${row._time}</div>
                        <div class="change-time">${row.change}</div>
                        <div class="change-time">${row.change_id}</div>
                    </li>
                `);

                viz.$el.append($markup);
			});
		},
	});

	return SPChangeView;

});


