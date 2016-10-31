
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

const request = require("unirest");
const configs = require("../configs/configs");

exports.info  = [
	function (req, res) {
		var access_token = null;
			
		if (req.query.access_token)
			access_token = req.query.access_token;
		else if (req.get("Authorization")) {
			var splits = req.get("Authorization").split(" ");
			if (splits.length == 2 && splits[0].toLowerCase() === "bearer")
				access_token = splits[1];
		}
		
		if (access_token) {
			request.get(configs.filter)
			.query({coll:"access_token"})
			.query({filter:"token"})
			.query({filter_value:access_token})
			.end(function(result){
				if (result.error || !result.body) {
					res.status(400);
					res.json({error: "invalid_token"});
				} else if (new Date().getTime() > new Date(result.body.expirationDate).getTime()) {
					console.log("TOKEN EXPIRED");
					res.status(400);
					res.json({error: "invalid_token"});
				} else {
					
					request.get(configs.filter)
					.query({coll:"account"})
					.query({filter:"_id"})
					.query({filter_value:result.body.userId})
					.end(function(result2) {
						if (result2.error || !result2.body) {
							res.status(400);
							res.json({error: "invalid_token"});
						} else {
							if (result.body.expirationDate) {
								var expirationLeft = Math.floor((new Date(result.body.expirationDate).getTime() - new Date().getTime()) / 1000);
								if (expirationLeft <= 0) 
									res.json({error: "invalid_token"});
								else 
									res.json({audience: result2.body, expires_in:expirationLeft, isValid:true});
							} else {
								res.json({audience: result2.body, isValid:true});
							}
						}
					});
					
				}
			});
		} else {
			res.json({error: "invalid_token"});
		}
	}
];
