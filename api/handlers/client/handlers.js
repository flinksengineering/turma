
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

exports.create = function (request, reply) {
	var server = arguments["0"]["server"];
	var params = request.payload;
	server.seneca.act(
		{role:"store", cmd:"create"}, 
		{coll:"client", entity:params},
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
		{coll:"client", entity:params},
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
		{coll:"client", entity:params},
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
		{coll:"client", entity:params, criteria:criteria},
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
		{coll:"client", entity:params},
		function(err, out){
			reply(err || out);
		}
	);
};


