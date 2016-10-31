
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

const request     = require("unirest");
const oauth2orize = require("oauth2orize");
const passport    = require("passport");
const login       = require("connect-ensure-login");
const configs     = require("../configs/configs");
const utils       = require("../utils/utils");
	
var server = oauth2orize.createServer();

/**
 * Grant implicit authorization.
 *
 * The callback takes the "client" requesting authorization, the authenticated
 * "user" granting access, and their response, which contains approved scope,
 * duration, etc. as parsed by the application. The application issues a token,
 * which is bound to these values.
 */
server.grant(oauth2orize.grant.token(function (client, user, ares, callback) {
	var header = {"Content-type":"application/json"};
	var token  = utils.uid(configs.token.accessTokenLength);
	var args   = {
		role:"store", 
		cmd:"create",
		coll:"access_token",
		entity: {
			token:token, 
			expirationDate:configs.token.calculateExpirationDate(), 
			userId:user._id, clientId:client._id, scope:client.scope
		}
	};
	
	request.post(configs.create, header, args, function(result){
		if (result.error) {
			return callback(result.error);
		}
		return callback(null, token, {expires_in:configs.token.expiresIn});
	});
}));

/**
 * User authorization endpoint
 *
 * "authorization" middleware accepts a "validate" callback which is
 * responsible for validating the client making the authorization request. In
 * doing so, is recommended that the "redirectURI" be checked against a
 * registered value, although security requirements may vary accross
 * implementations. Once validated, the "done" callback must be invoked with
 * a "client" instance, as well as the "redirectURI" to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction. It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization). We accomplish that here by routing through "ensureLoggedIn()"
 * first, and rendering the "dialog" view.
 */
 
exports.authorization = [
	login.ensureLoggedIn(),
	
	server.authorization(function (clientId, redirectURI, scope, callback) {
		request.get(configs.filter)
		.query({coll:"client"})
		.query({filter:"clientId"})
		.query({filter_value:clientId})
		.end(function(client_res){
			if (client_res.error) 
				return callback(client_res.error);
			if (client_res.body) 
				client_res.body.scope = scope;
			if (client_res.body.redirectUri != redirectURI)
				return callback(null, false);
			return callback(null, client_res.body, redirectURI);
		});
	}),
	
	function (req, res, next) {
		request.get(configs.filter)
		.query({coll:"client"})
		.query({filter:"clientId"})
		.query({filter_value:req.query.client_id})
		.end(function(client_res){
			if (!client_res.error && client_res.body && client_res.body.trustedClient && client_res.body.trustedClient === true) {
				//This is how we short call the decision like the dialog below does
				server.decision({loadTransaction:false}, function (req, callback) {
					callback(null, {allow:true});
				})(req, res, next);
			} else {
				res.render("dialog", {transactionID:req.oauth2.transactionID, user:req.user, client:req.oauth2.client});
			}
		});
		
	}
];

/**
 * User decision endpoint
 *
 * "decision" middleware processes a user's decision to allow or deny access
 * requested by a client application. Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
 
exports.decision = [
	login.ensureLoggedIn(),
	server.decision()
];

/**
 * Token endpoint
 *
 * "token" middleware handles client requests to exchange authorization grants
 * for access tokens. Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request. Clients must
 * authenticate when making requests to this endpoint.
 */ 
 
exports.token = [
	passport.authenticate(["clientBasic", "clientPassword"], {session:false}),
	server.token(),
	server.errorHandler()
];

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
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient(function (client, callback) {
	return callback(null, client._id);
});

server.deserializeClient(function (id, callback) {
	request.get(configs.filter)
	.query({coll:"client"})
	.query({filter:"_id"})
	.query({filter_value:id})
	.end(function(client_res){
		callback(client_res.error, client_res.body);
	});
});
