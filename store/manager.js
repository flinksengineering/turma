
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

const MongoClient = require("mongodb").MongoClient;
const Connection  = require("mongodb").Connection;
const async       = require("async");
const shortid     = require("shortid");
const bcrypt      = require("bcryptjs");

/**
 * MongoDB container manager.
 * @constructor
 **/
function MongoManager () {};

MongoManager.prototype.db = null;

/**
 * MongoManager method. Initialize store microservice. It allows to 
 * create a root user and it sets client credentials.
 * @method
 * @name init
 * @param {Object} config   - Config object.
 * @param {Object} options  - MongoDB options object.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.init = function (config, options, callback) {
	var that = this;
	
	var port = config.port ? config.port : Connection.DEFAULT_PORT;
	var url  = "mongodb://db:" + port + "/" + config.db_name;
	
	MongoClient.connect(url, options, function(err, db) {
		if(err) {
			callback(err);
			return;
		}
		that.db = db;
		
		async.waterfall([
			function (cb) {
				that.create_admin(cb);
			},
			function (data, cb) {
				var key    = process.env.SITE_KEY;
				var secret = process.env.SITE_SECRET;
				var redir  = process.env.SITE_REDIRECT;
				that.create_client("site client", key, secret, "site", redir, cb);
			}
		], callback);
		
	});
};

/**
 * MongoManager method. It allows to create a root user.
 * @method
 * @name create_admin
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.create_admin = function (callback) {
	var that     = this;
	var username = process.env.ROOT_USERNAME;
	var password = process.env.ROOT_PASSWORD;
	
	async.waterfall([
		function (cb) {
			that.read("account", {username:username}, null, cb);
		},
		function (user, cb) {
			if (user) {
				cb(null);
				return;
			}
			var salt  = bcrypt.genSaltSync(10);
			var crypt = bcrypt.hashSync(password, salt);
			var admin = {
				"first_name":"Ciccio", 
				"last_name":"Panda",
				"username": username,
				"password": crypt,
				"scope": "admin"
			};
			that.create("account", admin, cb);
		}
	], function (err, ret) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, that.db);
	});
};

/**
 * MongoManager method. It allows to add a client.
 * @method
 * @name create_client
 * @param {string} name     - The name of the client.
 * @param {string} key      - The client key.
 * @param {string} secret   - The client secret.
 * @param {string} scope    - The client scope.
 * @param {string} redir    - The client redirect URI.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.create_client = function (name, key, secret, scope, redir, callback) {
	var that = this;
	
	async.waterfall([
		function (cb) {
			that.read("client", {clientId:key}, null, cb);
		},
		function (client, cb) {
			if (client) {
				cb(null);
				return;
			}
			var salt  = bcrypt.genSaltSync(10);
			var crypt = bcrypt.hashSync(secret, salt);
			var client = {
				"name":name, 
				"clientId": key,
				"clientSecret": crypt,
				"trustedClient": true,
				"redirectUri": redir,
				"scope": scope
			};
			that.create("client", client, cb);
		}
	], function (err, ret) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, that.db);
	});
};

/**
 * MongoManager method. It allows to add an index.
 * @method
 * @name add_index
 * @param {string} coll        - The collection name.
 * @param {string} fieldOrSpec - It defines the index. It could be just 
 * a field name or a json object of grouped fields.
 * @param {Object} options     - Optional mongodb settings.
 * @param {Object} callback    - Callback function.
 **/
MongoManager.prototype.add_index = function (coll, fieldOrSpec, options, callback) {
	this.db.collection(coll).createIndex(fieldOrSpec, options, function(err, ret){
		if(err){
			console.log("** STORE MICROSERVICE: ENSURE INDEX FAILURE!");
			console.error(err);
			callback(err);
			return;
		}
		callback(null, ret);
	});
};

/**
 * MongoManager method. It allows to add a new entity into the db.
 * @method
 * @name create
 * @param {string} coll     - The collection name.
 * @param {Object} entity   - The entity to store.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.create = function(coll, entity, callback){
	var that = this;
	
	async.waterfall([
		function(cb){
			entity["_id"] = shortid.generate();
			entity["last_modified_date"] = new Date().getTime();
			that.db.collection(coll).insertOne(entity, { w: 1, safe: true }, cb);
		},
		function(results, cb){
			cb(null, results["ops"][0]);
		}
	], 
	function(err, data){
		if (err) {
			callback(err);
		} else {
			callback(null, data);
		}
	});
};

/**
 * MongoManager method. It allows to retrieve an entity from the db.
 * @method
 * @name read
 * @param {string} coll - The collection name.
 * @param {Object} entity - The criteria on which find the object of
 * interest.
 * @param {Object} [projection] - It allows to limitate the number of 
 * fields for each obtained result.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.read = function(coll, entity, projection, callback){
	var that = this;
	
	async.waterfall([
		function(cb){
			if (entity.hasOwnProperty("id")) {
				entity["_id"] = entity["id"];
                delete entity["id"];
			}
			if (projection)
				that.db.collection(coll).findOne(entity, projection, cb);
			else that.db.collection(coll).findOne(entity, cb);
		}
	],
	function(err, data){
		if(err)
			callback(err);
		else
			callback(null, data);
	});
};

/**
 * MongoManager method. It allows to update an existing entity into the 
 * db.
 * @method
 * @name update
 * @param {string} coll - The collection name.
 * @param {Object} criteria - The criteria used to match the entity.
 * @param {Object} entity - The criteria on which find the object of
 * interest.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.update = function(coll, criteria, entity, callback){
	var that = this;
	
	async.waterfall([
		function(cb){
			if (criteria.hasOwnProperty("id")) {
				criteria["_id"] = criteria["id"];
                delete criteria["id"];
			}
			if (entity.hasOwnProperty("id")) {
				entity["_id"] = entity["id"];
                delete entity["id"];
			}
			entity["last_modified_date"] = new Date().getTime();
			that.db.collection(coll).updateOne(criteria, {"$set": entity}, cb);
		},
		function(results, cb){
			cb(null, entity);
		}
	],
	function(err, data){
		if(err)
			callback(err);
		else
			callback(null, data);
	});
};

/**
 * MongoManager method. It allows to update an existing entity into the 
 * db. If the document does not exist it creates a new one.
 * @method
 * @name upsert
 * @param {string} coll - The collection name.
 * @param {Object} criteria - The criteria used to match the entity.
 * @param {Object} entity - The criteria on which find the object of
 * interest.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.upsert = function(coll, criteria, entity, callback){
	var that = this;
	
	async.waterfall([
		function(cb){
			if (criteria.hasOwnProperty("id")) {
				criteria["_id"] = criteria["id"];
                delete criteria["id"];
			}
			if (entity.hasOwnProperty("id")) {
				entity["_id"] = entity["id"];
                delete entity["id"];
			}
			entity["last_modified_date"] = new Date().getTime();
			that.db.collection(coll).findOneAndUpdate(criteria, {"$set":entity}, {upsert:true}, cb);
		},
		function(results, cb){
			var is_upserted = results.lastErrorObject.updatedExisting;
			cb(null, is_upserted, entity);
		}
	],function(err, status, data){
		if(err)
			callback(err);
		else
			callback(null, {"upsert":status, "data":data});
	});
};

/**
 * MongoManager method. It allows to remove an existing entity from the 
 * db.
 * @method
 * @name delete
 * @param {string} coll - The collection name.
 * @param {Object} entity - The criteria on which find the object of
 * interest.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.delete = function(coll, entity, callback){
	var that = this;
	
	async.waterfall([
		function(cb){
			if (entity.hasOwnProperty("id")) {
				entity["_id"] = entity["id"];
                delete entity["id"];
			}
			that.db.collection(coll).deleteOne(entity, cb);
		}
	],
	function(err, data){
		if(err)
			callback(err);
		else
			callback(null, data["result"]);
	});
};

/**
 * MongoManager method. It allows to paginate the entities fetched from  
 * the db.
 * @method
 * @name paginate
 * @param {string} coll - The collection name.
 * @param {Number} from - The timestamp from which to search for.
 * @param {Number} size - The number of results for each page.
 * @param {Object} [owner] - The owner of the entity.
 * @param {Object} [projection] - It allows to limitate the number of 
 * fields for each obtained entity.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.paginate = function(coll, from, size, owner, 
	projection, callback){
	var that = this;
	var ret  = {};
	
	async.waterfall([
		function(cb){
			var d = {};
			if(owner)
				d = {"by._id": owner["_id"]};
			that.db.collection(coll).count(d, cb);
		},
		function(total, cb){
			ret["total"] = total;
			ret["pages"] = Math.ceil(total/size);
			var dict = {"last_modified_date": {"$lt": parseInt(from)}};
			if(owner)
				dict["by._id"] = owner._id;
			if(projection)
				var cursor = that.db.collection(coll).find(dict, projection);
			else 
				var cursor = that.db.collection(coll).find(dict);
			cursor.sort({"last_modified_date": -1}).limit(parseInt(size)).toArray(cb);
		}
	],
	function(err, data){
		if(err)
			callback(err);
		else{
			ret["data"] = data;
			callback(null, ret);
		}
	});
};

/**
 * MongoManager method. It allows to search througt the stored entities.
 * @method
 * @name search
 * @param {string} coll - The collection name.
 * @param {Number} from - The timestamp from which to search for.
 * @param {Number} size - The number of results for each page.
 * @param {string} q - The value to search for a given field.
 * @param {string} field - The field on which to search.
 * @param {Object} [projection] - It allows to limitate the number of 
 * fields for each obtained entity.
 * @param {Object} callback - Callback function.
 **/
MongoManager.prototype.search = function(coll, from, size, q, field, 
	projection, callback){
	var that = this;
	var ret  = {};
	
	async.waterfall([
		function (cb) {
			var d    = {};
			d[field] = {"$regex": q};
			that.db.collection(coll).count(d, cb);
		},
		function (total, cb) {
			ret["total"] = total;
			ret["pages"] = Math.ceil(total/size);
			var dict     = {"last_modified_date": {"$lt": parseInt(from)}};
			dict[field]  = {"$regex": q};
			if(projection)
				var cursor = that.db.collection(coll).find(dict, projection);
			else 
				var cursor = that.db.collection(coll).find(dict);
			cursor.sort({"last_modified_date": -1}).limit(parseInt(size)).toArray(cb);
		}
	],
	function(err, data){
		if(err)
			callback(err);
		else{
			ret["data"] = data;
			callback(null, ret);
		}
	});
};

MongoManager.prototype.filter = function(coll, filter, filter_value, callback){
	var that = this;
	
	async.waterfall([
		function(cb){
			var entity = {};
			entity[filter] = filter_value;
			that.db.collection(coll).findOne(entity, cb);
		}
	], callback);
};

module.exports = function(options) {
	var mm = null;
	
	return {
		
		init: function(args, options, callback) {
			mm = new MongoManager();
			mm.init(args, options, callback);
		},
		
		create_document: function(args, callback) {
			mm.create(args.coll, args.entity, callback);
		},
		
		read_document: function(args, callback) {
			var projection = args.projection || null;
			mm.read(args.coll, args.entity, projection, callback);
		},
		
		update_document: function(args, callback) {
			mm.update(args.coll, args.criteria, args.entity, callback);
		},
		
		upsert_document: function(args, callback) {
			mm.upsert(args.coll, args.criteria, args.entity, callback);
		},

		delete_document: function(args, callback) {
			mm.delete(args.coll, args.entity, callback);
		},

		list_documents: function(args, callback) {
			var owner      = args.owner || null;
			var projection = args.projection || null;
			mm.paginate(args.coll, args.entity.from, args.entity.size, 
				owner, projection, callback);
		},

		search_documents: function(args, callback) {
			var projection = args.projection || null;
			mm.search(args.coll, args.entity.from, args.entity.size, 
				args.entity.q, args.entity.field, projection, callback);
		},
		
		filter_document: function(args, callback) {
			mm.filter(args.coll, args.filter, args.filter_value, callback);
		},
		
	};
};
