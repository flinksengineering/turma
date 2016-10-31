
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

const account  = require("../handlers/account/handlers.js");
const company  = require("../handlers/company/handlers.js");
const client   = require("../handlers/client/handlers.js");
const category = require("../handlers/category/handlers.js");

module.exports = function(server){
	
	/**
	 * ACCOUNT ROUTES
	 **/
	 
	server.route({
		method: "POST",
		path: "/api/accounts",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: account.create
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/accounts",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: account.paginate
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/accounts/{id}",
		config: {
			auth: {strategy:"implicit", scope:["admin", "user"]},
			handler: account.read
		}
	});
	
	server.route({
		method: "PUT",
		path: "/api/accounts/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: account.update
		}
	});
	
	server.route({
		method: "DELETE",
		path: "/api/accounts/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: account.delete
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/accounts/search",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: account.search
		}
	});
	
	/**
	 * CLIENT ROUTES
	 **/
	 
	server.route({
		method: "POST",
		path: "/api/clients",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: client.create
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/clients",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: client.paginate
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/clients/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: client.read
		}
	});
	
	server.route({
		method: "PUT",
		path: "/api/clients/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: client.update
		}
	});
	
	server.route({
		method: "DELETE",
		path: "/api/clients/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: client.delete
		}
	});
	
	/**
	 * CATEGORY ROUTES
	 * */
	
	server.route({
		method: "POST",
		path: "/api/categories",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: category.create
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/categories",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: category.paginate
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/categories/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: category.read
		}
	});
	
	server.route({
		method: "PUT",
		path: "/api/categories/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: category.update
		}
	});
	
	server.route({
		method: "DELETE",
		path: "/api/categories/{id}",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: category.delete
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/categories/search",
		config: {
			auth: {strategy:"implicit", scope:"admin"},
			handler: category.search
		}
	});
	
	/**
	 * COMPANY ROUTES
	 * */
	 
	server.route({
		method: "POST",
		path: "/api/companies",
		config: {
			auth: {strategy:"implicit", scope: ["admin", "contributor"]},
			handler: company.create
		}
	});
	
	server.route({
		method: "GET",
		path: "/api/companies",
		handler: company.paginate
	});
	
	server.route({
		method: "GET",
		path: "/api/companies/{id}",
		handler: company.read
	});
	
	server.route({
		method: "PUT",
		path: "/api/companies/{id}",
		config: {
			auth: {strategy:"implicit", scope: ["admin", "contributor"]},
			handler: company.update
		}
	});
	
	server.route({
		method: "DELETE",
		path: "/api/companies/{id}",
		config: {
			auth: {strategy:"implicit", scope: ["admin", "contributor"]},
			handler: company.delete
		}
	});
	
	server.route({
		method: "POST",
		path: "/api/companies/search",
		handler: company.search
	});
	
};
