
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

const request                = require("unirest");
const bcrypt                 = require("bcryptjs");
const passport               = require("passport");
const LocalStrategy          = require("passport-local").Strategy;
const BasicStrategy          = require("passport-http").BasicStrategy;
const ClientPasswordStrategy = require("passport-oauth2-client-password").Strategy;
const BearerStrategy         = require("passport-http-bearer").Strategy;
const configs                = require("../configs/configs");

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
 
passport.use(new LocalStrategy(function (username, password, callback) {
	
	request.get(configs.filter)
	.query({coll:"account"})
	.query({filter:"username"})
	.query({filter_value:username})
	.end(function(result){
		if (result.error) {
			return callback(result.error);
		}
		if (!result.body) {
			return callback(null, false);
		}
		if (!bcrypt.compareSync(password, result.body.password)) {
			return callback(null, false);
		}
		return callback(null, result.body);
	});
	
}));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the "token" endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the "Authorization" header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
 
passport.use("clientBasic", new BasicStrategy(function (username, password, callback) {
	
	request.get(configs.filter)
	.query({coll:"client"})
	.query({filter:"clientId"})
	.query({filter_value:username})
	.end(function(result){
		if (result.error) {
			return callback(result.error);
		}
		if (!result.body) {
			return callback(null, false);
		}
		if (!bcrypt.compareSync(password, result.body.clientSecret)) {
			return callback(null, false);
		}
		return callback(null, result.body);
	});
	
}));

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
 
passport.use("clientPassword", new ClientPasswordStrategy(function (clientId, clientSecret, callback) {
	
	request.get(configs.filter)
	.query({coll:"client"})
	.query({filter:"clientId"})
	.query({filter_value:clientId})
	.end(function(result){
		if (result.error) {
			return callback(result.error);
		}
		if (!result.body) {
			return callback(null, false);
		}
		if (!bcrypt.compareSync(clientSecret, result.body.clientSecret)) {
			return callback(null, false);
		}
		return callback(null, result.body);
	});
	
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based 
 * on an access token (aka a bearer token). If a user, they must have 
 * previously authorized a client application, which is issued an access 
 * token to make requests on behalf of the authorizing user.
 */
 
passport.use(new BearerStrategy(function (accessToken, callback) {
	
	request.get(configs.filter)
	.query({coll:"access_token"})
	.query({filter:"token"})
	.query({filter_value:accessToken})
	.end(function(token_res){
		if (token_res.error) 
			return callback(token_res.error);
		if (!token_res.body)
			return callback(null, false);
		if (new Date().getTime() > new Date(token_res.body.expirationDate).getTime()) {
			
			request.delete(configs.create)
			.send({role:"store", cmd:"delete", coll:"access_token", 
				token:accessToken})
			.end(function(delete_res){
				return callback(delete_res.error || delete_res.body);
			});
			
		} else {
			if (token_res.body.userId !== null) {
				
				request.get(configs.filter)
				.query({coll:"account"})
				.query({filter:"_id"})
				.query({filter_value:token_res.body.userId})
				.end(function(user_res){
					if (user_res.error)
						return callback(user_res.error);
					if (!user_res.body) 
						return callback(null, false);
					return callback(null, user_res.body, {scope: "*"});
				});
				
			} else {
				
				request.get(configs.filter)
				.query({coll:"client"})
				.query({filter:"_id"})
				.query({filter_value:token_res.body.clientId})
				.end(function(client_res){
					if (client_res.error)
						return callback(client_res.error);
					if (!client_res.body) 
						return callback(null, false);
					return callback(null, client_res.body, {scope: "*"});
				});
				
			}
		}
	});
	
}));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated. To complete the transaction, the
// user must authenticate and approve the authorization request. Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session. Typically this will be a
// simple matter of serializing the client"s ID, and deserializing by finding
// the client by ID from the database.

passport.serializeUser(function (user, callback) {
	callback(null, user._id);
});

passport.deserializeUser(function (id, callback) {
	request.get(configs.filter)
	.query({coll:"account"})
	.query({filter:"_id"})
	.query({filter_value:id})
	.end(function(result){
		callback(result.error, result.body);
	});
});
	
