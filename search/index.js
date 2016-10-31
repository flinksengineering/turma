
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

const async   = require("async");
const manager = require("./manager");

module.exports = function(options){
	
	var name = "search";
	
	this.add({role:name, cmd:"create"}, manager.create_document);
	this.add({role:name, cmd:"update"}, manager.update_document);
	this.add({role:name, cmd:"delete"}, manager.delete_document);
	this.add({role:name, cmd:"search"}, manager.search_documents);
	
	this.add({init:name}, function(args, callback){
		async.waterfall([
			function(cb) {
				manager.exists_index(cb);
			},
			function(data, status, cb) {
				if(!data) 
					manager.init_index(cb);
				else cb(null);
			}
		], callback);
	});
	
	return {name:name};
	
};
