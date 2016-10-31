
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

const express        = require("express");
const cookieParser   = require("cookie-parser");
const expressSession = require("express-session");
const bodyParser     = require("body-parser");
const cors           = require("cors");
const passport       = require("passport");
const site           = require("./handlers/site");
const user           = require("./handlers/user");
const oauth2         = require("./auth/oauth2");
const configs        = require("./configs/configs");

var sessionStorage;
if (configs.session.type === "MemoryStore") {
	var MemoryStore = expressSession.MemoryStore;
	console.log("Using MemoryStore for the Session");
	sessionStorage = new MemoryStore();
} else {
	throw new Error("Within configs the session type is unknown: " + configs.session.type);
}

var app = express();

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(expressSession({
	saveUninitialized: true,
	resave: true,
	secret: configs.session.secret,
	store: sessionStorage,
	key: "authorization.sid",
	cookie: {maxAge: configs.session.maxAge}
}));

app.use(express.static(__dirname + "/static"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

require("./auth/auth");

app.get("/login", site.loginForm);
app.post("/login", site.login);
app.get("/logout", site.logout);

app.get("/oauth/authorize", oauth2.authorization);
app.post("/oauth/authorize/decision", oauth2.decision);
app.post("/oauth/token", oauth2.token);

app.get("/user/info", user.info);

app.listen({host:"auth", port:10008}, function(){
	console.log("** WIDGET AUTHORIZATION SERVER: LISTEN ON PORT 10008.");
});
