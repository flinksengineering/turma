
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

const manager = require("./manager.js")();
const configs = require("./config/config.js");

module.exports = function(options){
	
	var name = "store";
	
	this.add({role:name, cmd:"create"}, manager.create_document);
	this.add({role:name, cmd:"paginate"}, manager.list_documents);
	this.add({role:name, cmd:"search"}, manager.search_documents);
	this.add({role:name, cmd:"filter"}, manager.filter_document);
	this.add({role:name, cmd:"read"}, manager.read_document);
	this.add({role:name, cmd:"update"}, manager.update_document);
	this.add({role:name, cmd:"upsert"}, manager.upsert_document);
	this.add({role:name, cmd:"delete"}, manager.delete_document);
	
	this.add({init:name}, function(args, callback){
		manager.init(configs.db_config, configs.options, function(err, result){
			if (err) {
				console.error("** MICROSERVICE STORE: FATAL ERROR ON MONGODB STARTUP");
				console.error(err);
				process.exit(-1);
			} 
			console.log("** MICROSERVICE STORE: CONNECTED CORRECTLY TO THE MONGODB SERVER");
			callback(null);
		});
	});
	
	return {name:name};
	
};
