
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

const moment = require("moment-timezone");
const that   = this;

exports.timezone = process.env.TZ;

exports.token = {
	expiresIn: 3600,
	calculateExpirationDate: function () {
		var date = new Date(new Date().getTime() + (this.expiresIn * 1000));
		return moment(date).tz(that.timezone).format();
	},
	authorizationCodeLength: 16,
	accessTokenLength: 256,
	refreshTokenLength: 256
};

/**
 * Session configuration
 *
 * type - The type of session to use. MemoryStore for "in-memory",
 * or MongoStore for the mongo database store.
 * maxAge - The maximum age in milliseconds of the session. Use null for
 * web browser session only. Use something else large like 3600000 * 24 * 7 * 52
 * for a year.
 * secret - The session secret that you should change to what you want
 * dbName - The database name if you're using Mongo
 */
exports.session = {
	type: "MemoryStore",
	maxAge: 3600000 * 24 * 7 * 52,
	secret: "CmpLBfyWePJABHsE",
	dbName: "Session"
};

exports.create = "http://store:44001/act";
exports.filter = "http://store:44001/act?role=store&cmd=filter";
