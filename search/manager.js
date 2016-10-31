
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

const async         = require("async");
const elasticsearch = require("elasticsearch");
const configs       = require("./configs/configs");
const queries       = require("./queries/queries");

function ESManager(){};

ESManager.prototype.conn = null;

/**
 * ESManager method - Get a newly created connection to the elasticsearch 
 * server.
 * @method
 * @name start_connection
 **/
ESManager.prototype.start_connection = function(){
	this.conn = new elasticsearch.Client({
		host: {
			host:"elastic",
			port:configs.elastic.port
		},
		log: configs.elastic.log
	});
};

/**
 * ESManager method - Initialize a new index if it does not exist.
 * @method
 * @name init_index
 * @param {function} callback - callback function.
 **/
ESManager.prototype.init_index = function(callback){
	var that = this;
	async.waterfall([
		function(cb){
			that.conn.indices.create({
				"method": "PUT", 
				"index": configs.elastic.index, 
				"body": {
					"settings": configs.settings, 
					"mappings": configs.mappings
				}
			}, cb);
		}
	], callback);
};

/**
 * ESManager method - Check if an index already exists.
 * @method
 * @name exists_index
 * @param {function} callback - callback function.
 **/
ESManager.prototype.exists_index = function(callback){
	var that = this;
	async.waterfall([
		function(cb){
			that.conn.indices.exists({
				"index": configs.elastic.index
			}, cb);
		}
	], callback);
};

/**
 * ESManager method - Insert a new document into an elasticsearch collection.
 * @method
 * @name create_document
 * @param {string} type - The collection name.
 * @param {Object} entity - The json object to store.
 * @param {Object} callback - Callback function.
 **/
ESManager.prototype.create_document = function(type, entity, callback){
	var that = this;
	async.waterfall([
		function(cb){
			var id = entity._id || entity.id;
			delete entity._id;
			that.conn.create({ 
				"index": configs.elastic.index, 
				"type": type,
				"id": id,
				"body": entity
			}, cb);
		}
	], callback);
};

/**
 * ESManager method - Updates an existing document inside an elasticsearch
 * collection. If the document does not exist it creates a new one.
 * @method
 * @name update_document
 * @param {string} type - The collection name.
 * @param {Object} entity - The json entity to be updated.
 * @param {Object} callback - Callback function.
 **/
ESManager.prototype.update_document = function(type, entity, callback){
	var that = this;
	async.waterfall([
		function(cb){
			var id = entity._id || entity.id;
			delete entity._id;
			that.conn.update({
				"index": configs.elastic.index, 
				"type": type,
				"id": id,
				"body": {"doc": entity},
				"doc_as_upsert": true,
				"retry_on_conflict": 5
			}, cb);
		}
	], callback);
};

/**
 * ESManager method - Delete a document from an elasticsearch collection.
 * @method
 * @name delete_document
 * @param {string} type - the collection name.
 * @param {Object} entity - the json object to be deleted.
 * @param {Object} callback - callback function
 **/
ESManager.prototype.delete_document = function(type, entity, callback){
	var that = this;
	async.waterfall([
		function(cb){
			that.conn.delete({
				"index": configs.elastic.index, 
				"type": type,
				"id": entity._id || entity.id
			}, cb);
		}
	], callback);
};

/**
 * ESManager method - It checks if a document exists whether or not into
 * an elasticsearch collection.
 * @method
 * @name exists_document
 * @param {string} type - The collection name.
 * @param {object} entity - The Entity json object.
 * @param {object} callback - callback function
 **/
ESManager.prototype.exists_document = function(type, entity, callback){
	var that = this;
	async.waterfall([
		function(cb){
			that.conn.exists({
				"index": configs.elastic.index, 
				"type": type,
				"id": entity._id || entity.id
			}, cb);
		}
	], callback);
};

/**
 * ESManager method - It allows to get pagination metadata.
 * @method
 * @name pagination_meta
 * @param {Number} total - The number of items matching the query.
 * @param {Number} from - The starting offset.
 * @param {Number} size - The number of hits to return.
 **/
ESManager.prototype.pagination_meta = function(total, from, size) {
	var prev = null;
	var next = null;
	var num_pages    = Math.ceil(total/size);
	var current_page = 1 + (from/size);
	
	if(current_page == 1)
		prev = null;
	if(current_page == num_pages)
		next = null;
	if(current_page > 1)
		prev = current_page - 1;
	if(current_page < num_pages)
		next = current_page + 1;
		
	return {"prev":prev, "next":next};
	
};

/**
 * ESManager method - It allows to prepare paginated results.
 * @method
 * @name parse_search_results
 * @param {Object} hits - The result container.
 * @param {Number} from - The starting offset.
 * @param {Number} size - The number of hits to return.
 * @param {Function} callback - callback function.
 **/
ESManager.prototype.parse_search_results = function(hits, from, size, callback) {
	var that = this;
	async.waterfall([
		function(cb) {
			var pp = that.pagination_meta(hits["total"], from, size);
			cb(null, {
				"total":hits["total"], 
				"prev":pp["prev"], 
				"next":pp["next"], 
				"elements":hits["hits"]
			});
		}
	], callback);
	
};

/**
 * ESManager method - It allows to query documents.
 * @method
 * @name search_documents
 * @param {String} type - The collection name.
 * @param {Number} size - The number of hits to return.
 * @param {Number} from - The starting offset.
 * @param {string} query_type - The query type.
 * @param {Object} query_params - The query parameters.
 * @param {Function} callback - Callback function.
 **/
ESManager.prototype.search_documents = function(type, entity, callback) {
	var that = this;
	console.log("QUERY", JSON.stringify(queries.Query[entity.query_type](entity.query_params)));
	async.waterfall([
		function(cb) {
			that.conn.search({
				"index": configs.elastic.index, 
				"type": type,
				"size": entity.size,
				"from": entity.from,
				"body": queries.Query[entity.query_type](entity.query_params)
			}, cb);
		},
		function(data, search_status, cb) {
			that.parse_search_results(data["hits"], entity.from, entity.size, cb);
		}
	], callback);
};

function commons(manager){
	manager.start_connection();
	return manager;
};

exports.init_index = function(callback){
	var em = commons(new ESManager());
	em.init_index(callback);
};

exports.exists_index = function(callback){
	var em = commons(new ESManager());
	em.exists_index(callback);
};

exports.create_document = function(args, callback){
	var em = commons(new ESManager());
	em.create_document(args.type, args.entity, callback);
};

exports.update_document = function(args, callback) {
	var em = commons(new ESManager());
	em.update_document(args.type, args.entity, callback);
};

exports.delete_document = function(args, callback){
	var em = commons(new ESManager());
	em.delete_document(args.type, args.entity, callback);
};

exports.search_documents = function(args, callback){
	var em = commons(new ESManager());
	em.search_documents(args.type, args.entity, callback);
};
