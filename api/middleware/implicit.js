
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

const Boom    = require("boom");
const request = require("requestretry");
const configs = require("../configs/configs");

var internals = {};

internals.validate = function (token, callback) {
	var params = {
		url: configs.user_info,
		method: "GET",
		qs: {"access_token":token},
		json: true,
		maxAttempts: 3,
		retryDelay: 3000,
		retryStrategy: request.RetryStrategies.HTTPOrNetworkError 
	};
	
	request(params, function (err, response, body) {
		if (err) {
			callback(err);
			return;
		}
		callback(null, body.isValid, body.audience);
	});
};

internals.implementation = function (server, options) {
	
	const scheme = {
		authenticate: (request, reply) => {
			
			var authorization = request.headers.authorization;
			
			if (!authorization)
                return reply(Boom.unauthorized(null, "Bearer"));
                
            var splits     = authorization.split(/\s+/);
			var token_type = splits[0];
			var token      = splits[1];
			
			if (token_type.toLowerCase() !== "bearer")
				return reply(Boom.unauthorized(null, "Bearer"));
			
			return internals.validate(token, function (err, isValid, credentials) {
				if (err) 
                    return reply(err, {credentials:credentials, log: {tags: ["auth", "bearer"], data:err}});

                if (!isValid)
                    return reply(Boom.unauthorized("Bad token", "Bearer"), {credentials:credentials});

                if (!credentials || typeof credentials !== "object")
                    return reply(Boom.badImplementation("Bad token string received for Bearer auth validation"), {log: {tags:"token"}});

                return reply.continue({credentials:credentials});
			});
           
		}
	};
	
	return scheme;
	
};

exports.register = function (server, options, next) {
	server.auth.scheme("implicit", internals.implementation);
	next();
};

exports.register.attributes = {
    pkg: {
        "name": "implict flow authentication",
        "description": "This is the implict flow authentication provider",
        "main": "service.js",
        "author": "Flinks",
        "license": "Apache2"
    }
};
