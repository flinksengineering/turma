
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 **/

"use strict";

/**
 * Elastic DSL container manager.
 * @constructor
 * @param {object} json - Elastic DSL container.
 **/
function QueryManager () {};

QueryManager.prototype.json = null;

/**
 * QueryManager method. Initialize the DSL container to an empty dict.
 * @method
 * @name init
 **/
QueryManager.prototype.init = function () {
	this.json = {};
};

/**
 * QueryManager method. Return the DSL container.
 * @method
 * @name getJSON
 **/
QueryManager.prototype.getJSON = function () {
	return this.json;
};

/**
 * QueryManager method. It allows to add a property inside
 * the DSL container.
 * @method
 * @name createProperty
 * @param {string} path - Property dotted path.
 * @param {Object} value - Property value (a string or an array).
 **/
QueryManager.prototype.createProperty = function (path, value) {
	var schema = this.json;
    var pList = path.split(".");
    for(var i = 0; i < pList.length - 1; i++) {
        var elem = pList[i];
        if(!schema[elem]) 
			schema[elem] = {};
        schema = schema[elem];
    }
    value = typeof value === "string" ? value.toLowerCase() : value;
    schema[pList[pList.length - 1]] = value;
};

/**
 * QueryManager method. It allows to build a term query.
 * @method
 * @name buildTerm
 * @param {Object} item - The dotted path or the name of the field and
 * the indexed value.
 * @example Params format: 
 * 
 * { 
 * 		{"field": "field_name", "val": "field_value"} (required)
 * }
 **/
QueryManager.prototype.buildTerm = function (item) {
	var term    = {};
	var field   = item["field"];
	var value   = item["val"];
	term[field] = value;
	return {"term":term};
};

/**
 * QueryManager method. It allows to build a list of term queries.
 * @method
 * @name buildTerms
 * @param {Array} list - A list of objects each one composed by a dotted 
 * path or the name of the field, and an indexed value.
 * @example Params format: 
 * 
 * { 
 * 		[{"field": "field_name", "val": "field_value"}] (required)
 * }
 **/
QueryManager.prototype.buildTerms = function (list) {
	var that  = this;
	var terms = [];
	list.forEach(function(item, idx, array){
		terms.push(that.buildTerm(item));
	});
	return terms;
};

/**
 * QueryManager method. It allows to build a filter based on a single
 * term query.
 * @method
 * @name buildFilter
 * @param {string} query_type - Query type.
 * @param {Object} item - The dotted path or the name of the field and
 * the indexed value.
 * @example Params format: 
 * 
 * { 
 * 		{"field": "field_name", "val": "field_value"} (required)
 * }
 **/
QueryManager.prototype.buildFilter = function (query_type, item) {
	var term = this.buildTerm(item);
	this.createProperty("query." + query_type + ".filter", term);
};

/**
 * QueryManager method. It allows to build a filter based on the AND
 * clause.
 * @method
 * @name buildANDFilter
 * @param {string} query_type - Query type.
 * @param {Array} list - A list of objects each one composed by a dotted 
 * path or the name of the field, and an indexed value.
 * @example Params format: 
 * 
 * { 
 * 		[{"field": "field_name", "val": "field_value"}] (required)
 * }
 **/
QueryManager.prototype.buildANDFilter = function (query_type, list) {
	var terms = this.buildTerms(list);
	this.createProperty("query." + query_type + ".filter.bool.must", terms);
};

/**
 * QueryManager method. It allows to build a filter based on the AND
 * clause.
 * @method
 * @name buildGEOPoint
 * @param {string} path - Query type.
 * @param {Number} lat - Latitude long number.
 * @param {Number} lon - Longitude long number.
 **/
QueryManager.prototype.buildGEOPoint = function (path, lat, lon) {
	var geo   = {};
	geo[path] = {"lat":lat, "lon":lon};
	return geo;
};

exports.Query = {
	
	/**
	 * Query over one or more fields.
	 * @function
	 * @name query
	 * @param {Object} query_params - Params on which to apply DSL query.
	 * @example Params format: 
	 * 
	 * { 
	 * 		"query": {"text": "text to query", "fields": [csv fields]} (required)
	 * }
	 * 
	 **/
	query: function (query_params) {
		var qm = new QueryManager();
		var query_dict  = query_params["query"];
		qm.init();
		qm.createProperty("query.multi_match.query", query_dict["text"]);
		qm.createProperty("query.multi_match.fields", query_dict["fields"]);
		return qm.getJSON();
	},
	
	/**
	 * Filter over one or more fields (exact values).
	 * @function
	 * @name filter
	 * @param {Object} query_params - Params on which to apply DSL filter.
	 * @example Params format: 
	 * 
	 * { 
	 * 		"filter": [{"field": "field_name", "val": "field_value"}] (required)
	 * }
	 * 
	 * The filter allows to build a query like the one below:
	 * 
	 * SELECT company
	 * FROM   companies
	 * WHERE  (category = "tech" AND name = "XYZ")
	 * 
	 **/
	filter: function (query_params) {
		var qm = new QueryManager();
		var filter_dict = query_params["filter"];
		qm.init();
		if (filter_dict.length > 1) 
			qm.buildANDFilter("constant_score", filter_dict);
		if (filter_dict.length == 1) 
			qm.buildFilter("constant_score", filter_dict[0]);
		return qm.getJSON();
	},
	
	/**
	 * Filter query results over one or more fields.
	 * @function
	 * @name filtered_query
	 * @param {Object} query_params - Params on which to apply DSL query. 
	 * @example Params format: 
	 * 
	 * { 
	 * 		"filter": [{"field": "field_name", "val": "field_value"}], (required)
	 *   	"query":  {"text": "text to query", "fields": [csv fields]} (required)
	 * }
	 * 
	 **/
	filtered_query: function (query_params) {
		var qm = new QueryManager();
		qm.init();
		var filter_dict = query_params["filter"];
		var query_dict  = query_params["query"];
		
		if (filter_dict.length > 1) 
			qm.buildANDFilter("bool", filter_dict);
		if (filter_dict.length == 1) 
			qm.buildFilter("bool", filter_dict[0]);
			
		qm.createProperty("query.bool.must.multi_match.query", query_dict["text"]);
		qm.createProperty("query.bool.must.multi_match.fields", query_dict["fields"]);
		return qm.getJSON();
	},
	
	/**
	 * Return elements inside a circular area centered on (lat, lon) 
	 * coordinates. The radius should be less or equal than dist parameter.
	 * @function
	 * @name geo_point_distance
	 * @param {Object} query_params - Params on which to apply DSL query. 
	 * @example Params format: 
	 * 
	 * { 
	 * 		"lat": center latitude, (required)
	 * 		"lon": center longitude, (required)
	 * 		"dist": search radius, (required)
	 * 		"field": geo point field dotted path, (required)
	 * }
	 * 
	 **/
	geo_point_distance: function (query_params) {
		var qm = new QueryManager();
		qm.init();
		var field = query_params["field"];
		var lat   = query_params["lat"];
		var lon   = query_params["lon"];
		var geo_point   = qm.buildGEOPoint(field, lat, lon);
		qm.createProperty("query.bool.must.match_all", {});
		qm.createProperty("query.bool.filter.geo_distance", geo_point);
		qm.createProperty("query.bool.filter.geo_distance.distance", query_params["dist"] + "km");
		qm.createProperty("query.bool.filter.geo_distance.distance_type", "plane");
		return qm.getJSON();
	},
	
	/**
	 * Return elements inside a circular area centered on (lat, lon) 
	 * coordinates. The radius should be less or equal than dist parameter.
	 * Optionally you can add a filter clause or a filtered query clause.
	 * @function
	 * @name geo_point_distance_filtered_query
	 * @param {Object} query_params - Params on which to apply DSL query. 
	 * @example Params format: 
	 * 
	 * { 
	 * 		"lat": center latitude, (required)
	 * 		"lon": center longitude, (required)
	 * 		"dist": search radius, (required)
	 * 		"field": geo point field dotted path, (required)
	 * 		"filter": [{"field": "field_name", "val": "field_value"}], (optional)
	 *   	"query": {"text": "text to query", "fields": [csv fields]} (optional)
	 * }
	 * 
	 **/
	geo_point_distance_filtered_query: function (query_params) {
		var qm = new QueryManager();
		qm.init();
		
		var field = query_params["field"];
		var lat   = query_params["lat"];
		var lon   = query_params["lon"];
		var filter_dict = query_params["filter"] || null;
		var query_dict  = query_params["query"] || null;
		var geo_point   = qm.buildGEOPoint(field, lat, lon);
		
		if (!query_dict) 
			qm.createProperty("query.bool.must.match_all", {});
		
		if (!filter_dict) {
			qm.createProperty("query.bool.filter.geo_distance", geo_point);
			qm.createProperty("query.bool.filter.geo_distance.distance", query_params["dist"] + "km");
			qm.createProperty("query.bool.filter.geo_distance.distance_type", "plane");
		}
		
		if (query_dict) {
			qm.createProperty("query.bool.must.multi_match.query", query_dict["text"]);
			qm.createProperty("query.bool.must.multi_match.fields", query_dict["fields"]);
		}
		
		if (filter_dict) {
			var filters = [];
			var filter1 = {};
			var filter2 = {};
			
			filter1["geo_distance"] = geo_point;
			filter1.geo_distance["distance"] = query_params["dist"] + "km";
			filter1.geo_distance["distance_type"] = "plane";
			filters.push(filter1);
			
			if (filter_dict.length > 1) 
				filter2 = qm.buildTerms(filter_dict);
			if (filter_dict.length == 1) 
				filter2 = qm.buildTerm(filter_dict[0]);
			filters.push(filter2);
			
			qm.createProperty("query.bool.filter", filters);
		}
		
		return qm.getJSON();
	}
	
};

