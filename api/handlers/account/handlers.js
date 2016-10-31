
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

const bcrypt  = require("bcryptjs");

exports.create = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = request.payload;
	var salt   = bcrypt.genSaltSync(10);
	var crypt  = bcrypt.hashSync(params["password"], salt);
	params["password"] = crypt;
	server.seneca.act(
		{role:"store", cmd:"create"}, 
		{coll:"account", entity:params},
		function(err, out){
			reply(err || out);
		}
	);
};

exports.paginate = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = {from:request.query.from, size:request.query.size};
	server.seneca.act(
		{role:"store", cmd:"paginate"}, 
		{coll:"account", entity:params},
		function(err, out){
			reply(err || out);
		}
	);
};

exports.read = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = {id:request.params.id};
	server.seneca.act(
		{role:"store", cmd:"read"}, 
		{coll:"account", entity:params},
		function(err, out){
			reply(err || out);
		}
	);
};

exports.update = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = request.payload;
	var criteria = {id:request.params.id};
	server.seneca.act(
		{role:"store", cmd:"update"}, 
		{coll:"account", entity:params, criteria:criteria},
		function(err, out){
			reply(err || out);
		}
	);
};

exports.delete = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = {id:request.params.id};
	server.seneca.act(
		{role:"store", cmd:"delete"}, 
		{coll:"account", entity:params},
		function(err, out){
			reply(err || out);
		}
	);
};

exports.search = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = {from:request.query.from, size:request.query.size, 
		q:request.query.q, field:request.query.field};
	var projection = {"_id":true, "first_name":true, "last_name":true, 
		"last_modified_date":true};
	server.seneca.act(
		{role:"store", cmd:"search"}, 
		{coll:"account", entity:params, projection:projection},
		function(err, out){
			reply(err || out);
		}
	);
};


