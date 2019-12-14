// LIBRARY REQUIREMENTS
//
// In the require function, we include the necessary libraries and modules for
// the HTML dashboard. Then, we pass variable names for these libraries and
// modules as function parameters, in order.
//
// When you add libraries or modules, remember to retain this mapping order
// between the library or module and its function parameter. You can do this by
// adding to the end of these lists, as shown in the commented examples below.

require([
	"splunkjs/mvc",
	"splunkjs/mvc/utils",
	"splunkjs/mvc/tokenutils",
	"underscore",
	"jquery",
	"splunkjs/mvc/simplexml",
	"splunkjs/mvc/layoutview",
	"splunkjs/mvc/simplexml/dashboardview",
	"splunkjs/mvc/simplexml/dashboard/panelref",
	"splunkjs/mvc/simplexml/element/chart",
	"splunkjs/mvc/simplexml/element/event",
	"splunkjs/mvc/simplexml/element/html",
	"splunkjs/mvc/simplexml/element/list",
	"splunkjs/mvc/simplexml/element/map",
	"splunkjs/mvc/simplexml/element/single",
	"splunkjs/mvc/simplexml/element/table",
	"splunkjs/mvc/simplexml/element/visualization",
	"splunkjs/mvc/simpleform/formutils",
	"splunkjs/mvc/simplexml/eventhandler",
	"splunkjs/mvc/simplexml/searcheventhandler",
	"splunkjs/mvc/simpleform/input/dropdown",
	"splunkjs/mvc/simpleform/input/radiogroup",
	"splunkjs/mvc/simpleform/input/linklist",
	"splunkjs/mvc/simpleform/input/multiselect",
	"splunkjs/mvc/simpleform/input/checkboxgroup",
	"splunkjs/mvc/simpleform/input/text",
	"splunkjs/mvc/simpleform/input/timerange",
	"splunkjs/mvc/simpleform/input/submit",
	"splunkjs/mvc/searchmanager",
	"splunkjs/mvc/savedsearchmanager",
	"splunkjs/mvc/postprocessmanager",
	"splunkjs/mvc/simplexml/urltokenmodel",
	"/static/app/searchdict/js/searchdict_view.js",
	"/static/app/searchdict/js/searchdict_format.js",
	"/static/app/searchdict/js/spl.js",
	// Add comma-separated libraries and modules manually here, for example:
	// ..."splunkjs/mvc/simplexml/urltokenmodel",
	// "splunkjs/mvc/tokenforwarder"
	],
	function(
		mvc,
		utils,
		TokenUtils,
		_,
		$,
		DashboardController,
		LayoutView,
		Dashboard,
		PanelRef,
		ChartElement,
		EventElement,
		HtmlElement,
		ListElement,
		MapElement,
		SingleElement,
		TableElement,
		VisualizationElement,
		FormUtils,
		EventHandler,
		SearchEventHandler,
		DropdownInput,
		RadioGroupInput,
		LinkListInput,
		MultiSelectInput,
		CheckboxGroupInput,
		TextInput,
		TimeRangeInput,
		SubmitButton,
		SearchManager,
		SavedSearchManager,
		PostProcessManager,
		UrlTokenModel,
		SearchDictView,
		sd_format,
		SPL

		// Add comma-separated parameter names here, for example:
		// ...UrlTokenModel,
		// TokenForwarder
		) {

		var pageLoading = true;


		// ================================
		// TOKENS
		// ================================

		// Create token namespaces
		var urlTokenModel = new UrlTokenModel();
		mvc.Components.registerInstance('url', urlTokenModel);
		var defaultTokenModel = mvc.Components.getInstance('default', {create: true});
		var submittedTokenModel = mvc.Components.getInstance('submitted', {create: true});

		urlTokenModel.on('url:navigate', function() {
			defaultTokenModel.set(urlTokenModel.toJSON());
			if (!_.isEmpty(urlTokenModel.toJSON()) && !_.all(urlTokenModel.toJSON(), _.isUndefined)) {
				submitTokens();
			} else {
				submittedTokenModel.clear();
			}
		});

		// Initialize tokens
		defaultTokenModel.set(urlTokenModel.toJSON());

		function submitTokens() {
			// Copy the contents of the defaultTokenModel to the submittedTokenModel and urlTokenModel
			FormUtils.submitForm({ replaceState: pageLoading });
		}

		function setToken(name, value) {
			defaultTokenModel.set(name, value);
			submittedTokenModel.set(name, value);
		}

		function unsetToken(name) {
			defaultTokenModel.unset(name);
			submittedTokenModel.unset(name);
		}

		// ================================
		// SEARCH MANAGERS
		// ================================

		new SearchManager({
			id: "sd_search",
			preview: true,
			cache: true,
			search: '| rest /servicesNS/-/-/saved/searches | search eai:acl.app=searchdict | rex field=description "(?<description>^[^\\[]*)\\[(?<tags>(\\w+)(,(\\w+))*)\\]" | eval _raw=title." ".description." ".search, tags=split(tags, ",") | search tags=$category$ | eval updated=strftime(strptime(updated,"%FT%T%Z"), "%A %B %d, %Y") | fields title description search tags dispatch.earliest_time dispatch.latest_time updated _raw $search$ | sort title'
		}, {
			tokens: true
		});
		
		new SearchManager({
            "id": "sd_categories",
            "sample_ratio": null,
            "search": '| rest /servicesNS/-/-/saved/searches | search eai:acl.app=searchdict | rex field=description "\\[(?<tags>(\\w+)(,(\\w+))*)\\]" | fields tags | eval tags=split(tags, ",") | mvexpand tags | dedup tags | rename tags as value | eval label=upper(substr(value,1,1)).substr(value,2) | sort label',
            "latest_time": "$latest$",
            "earliest_time": "$earliest$",
            "status_buckets": 0,
            "cancelOnUnload": true,
            "app": utils.getCurrentApp(),
            "auto_cancel": 90,
            "preview": true,
            "tokenDependencies": {
            },
            "runWhenTimeIsUndefined": false
        }, {tokens: true});

		// ================================
		// SPLUNK LAYOUT
		// ================================

		$('header').remove();
		new LayoutView({"hideChrome": false, "hideAppBar": false, "hideSplunkBar": false})
			.render()
			.getContainerElement()
			.appendChild($('.dashboard-body')[0]);

		// ================================
		// DASHBOARD EDITOR
		// ================================

		new Dashboard({
			id: 'dashboard',
			el: $('.dashboard-body'),
			showTitle: true,
			editable: true
		}, {tokens: true}).render();

		// ================================
		// VIEWS: VISUAL ELEMENTS
		// ================================
		
		var SearchDictView = new SearchDictView({
			id: "sd_view",
			managerid: "sd_search",
			el: $("#sd_list")
		}).render();

		// ================================
		// VIEWS: INPUTS
		// ================================

		var search_input = new TextInput({
			id: "search_input",
			default: "",
			prefix: "| search ",
			value: "$form.search$",
			el: $('#search_input')
		}, {tokens: true}).render();

		search_input.on("change", function(newValue) {
			FormUtils.handleValueChange(search_input);
		});
		
		$("#search_input input").attr("placeholder", "Search...");
		
		var category_input = new DropdownInput({
            "id": "category_input",
            "choices": [
                {"label": "All Categories", "value": "*"}
            ],
            "searchWhenChanged": true,
            "showClearButton": true,
            "default": "*",
            "selectFirstChoice": false,
            "labelField": "label",
            "valueField": "value",
            "value": "$form.category$",
            "managerid": "sd_categories",
            "el": $('#category_input')
        }, {tokens: true}).render();

        category_input.on("change", function(newValue) {
            FormUtils.handleValueChange(category_input);
        });
		
		// ================================
        // SUBMIT FORM DATA
        // ================================
		
		$(".search-button .btn").click(function() {
			submitTokens();
		})
		
		// Initialize time tokens to default
		if (!defaultTokenModel.has('earliest') && !defaultTokenModel.has('latest')) {
			defaultTokenModel.set({ earliest: '0', latest: '' });
		}

		submitTokens();
		
		// ================================
        // EVENTS
        // ================================
		
		var searchOffset = $("#sd_search_container").offset().top;
		
		$(window).scroll(function() {
			if ($(window).scrollTop() >= searchOffset) {
				$("#sd_search_container").addClass("fixed");
				$("#sd_search_spacer").addClass("fixed");
			} else {
				$("#sd_search_container").removeClass("fixed");
				$("#sd_search_spacer").removeClass("fixed");
			}
			
		});

		$("#sd_list").on("click", ".sd_icon_copy", function() {
			$(this).addClass("check").html("&#xe5ca").delay(1000).queue(function() {
				$(this).removeClass("check").html("&#xe14d").dequeue();
			});

			var $temp = $("<textarea>");
			$("body").append($temp);
			$temp.val($(".sd_raw_query", $(this).closest(".sd_right")).val()).select();
			document.execCommand("copy");
			$temp.remove();
		});

		$("#sd_list").on("click", ".sd_icon_lines", function() {
			var $parent = $(this).closest(".sd_right");
			var hlight = !$(this).next().hasClass("active");
			if ($(this).hasClass("active")) {
				formatted_query = sd_format($(".sd_raw_query", $parent).val(), false, hlight)
				$(".sd_query", $parent).html(formatted_query).removeClass("multiline");
				$(this).removeClass("active");
			} else {
				formatted_query = sd_format($(".sd_raw_query", $parent).val(), true, hlight)
				$(".sd_query", $parent).html(formatted_query).addClass("multiline");
				$(this).addClass("active");
			}
		});
		
		$("#sd_list").on("click", ".sd_tag", function() {
			setToken("form.category", $(this).text());
		});

		$("#sd_list").on("click", ".sd_icon_highlight", function() {
			var $parent = $(this).closest(".sd_right");
			if ($(this).hasClass("active")) {
				$(".sd_code span", $parent).addClass("highlight");
				$(this).removeClass("active");
			} else {
				$(".sd_code span", $parent).removeClass("highlight");
				$(this).addClass("active");
			}
		});
		
		$("#sd_list").on("click", ".sd_keyword", function(e) {
			e.stopPropagation();
			var keyword = $(this).text();
			if (keyword in SPL) {
				var helpBox = $("#sd_help");
				var k = SPL[keyword];
				var examples = ''
				
				for (var i=0; i<4; i++) {
					var comment = (i == 0) ? "commentcheat" : "comment" + i.toString();
					var example = (i == 0) ? "examplecheat" : "example" + i.toString();
					if (comment in k && example in k) {
						examples += `
							<dl>
								<dt class="sd_help_desc">${k[comment]}</dt>
								<dd class="sd_help_desc code">${k[example]}</dd>
							</dl>`
					}
				}
				
				$("#sd_help_keyword", helpBox).text(keyword);
				$("#sd_help_shortdesc", helpBox).text(("shortdesc" in k) ? k.shortdesc : k.description);
				$("#sd_help_longdesc", helpBox).text(k.description);
				$("#sd_help_syntax", helpBox).text(k.syntax);
				$("#sd_help_related", helpBox).text(("related" in k) ? k.related : "N/A");
				$("#sd_help_examples", helpBox).html(examples);
				$("#sd_help").addClass("active");
			}
			
			var link = "https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/" + keyword;
			$("#sd_help_doclink").attr("href", link);
		});
		
		$(document).click(function() {
			$("#sd_help").removeClass("active");
		});
		
		// ================================
		// DASHBOARD READY
		// ================================

		DashboardController.ready();
		pageLoading = false;

	}
);

