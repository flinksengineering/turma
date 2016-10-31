
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

function Visitor () {};

Visitor.prototype.eval = function (skeleton, params, skeleton_type, callback) {
	switch (skeleton_type) {
		case "seq": 
			this.eval_seq(skeleton, params, callback); 
			break;
		case "map": 
			this.eval_map(skeleton, params, callback);
			break;
	}
};

Visitor.prototype.eval_seq = function (skeleton, params, callback) {
	runner.serial_run(skeleton.execute, params, callback);
};


Visitor.prototype.eval_map = function (skeleton, params, callback) {
	runner.parallel_run(skeleton.execute, params, callback);
};

exports.Visitor = function () {
	return new Visitor();
};
