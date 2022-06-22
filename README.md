# Search+

Search+ is a Splunk application that provides a faster, more intuative, and richer experience for viewing your saved searches. Search attributes such as the commands, datamodels, fields, indexes, macros, lookups, and functions associated with a search are automatically parsed for quick filtering. 

## Usage

- **Filters**: Use the filter menu on the left hand side to filter by last update time, keywords on title / description, app, owner, status, commands, datamodels, fields, indexes, macros, lookups, functions, correlation search, security domain, severity, MITRE ATT&CK tactic, and MITRE ATT&CK technique. View the underlying filtered search by clicking the settings icon and then "View Filtered Search".

- **Search Details**: Click on a search to drilldown into its underlying query, description, timespan, schedule, search attributes, and correlation search attributes (if applicable). Hover over the search query and click on the search controls to quickly open in search, copy, or link to Splunk's default saved search manager for editing. 

- **Automatic Updates**: Search+ is able to quickly return saved searches and their associated attributes by cacheing this data within the "sp_search_inventory" KV store whenever an update is detected, via the "Search Inventory - Lookup Gen" saved search. When first using Search+, manually build this KV store by clicking the settings icon and then "Rebuild Search Inventory". 