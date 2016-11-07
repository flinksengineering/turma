
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

const runner = require("./runner");

function Visitor (callback) {
	this.callback = callback;
};

Visitor.prototype.get_type = function (item) {
	return item.constructor.name;
};

Visitor.prototype.eval = function (skeleton, params) {
	switch (this.get_type(skeleton)) {
		case "Seq": 
			this.eval_seq(skeleton, params); 
			break;
		case "Map": 
			this.eval_map(skeleton, params); 
			break;
	}
};

Visitor.prototype.eval_seq  = function (skeleton, params) {
	runner.series(skeleton.execute, params, this.callback);
};

Visitor.prototype.eval_map  = function (skeleton, params) {
	runner.map(skeleton.execute, params, this.callback);
};

exports.Visitor = function (callback) {
	return new Visitor(callback);
};
