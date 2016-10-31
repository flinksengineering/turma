
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
 
exports.elastic  = {
	port: process.env.DB_PORT,
	log: "trace",
	sniffOnStart: true,
	sniffInterval: 60000,
	index:process.env.DB_NAME
};

exports.settings = {
	"analysis": {
		"filter": {
			"trigrams_filter": {
				"type": "ngram",
				"min_gram": 3,
				"max_gram": 3
			}
		},
		"analyzer": {
			"trigrams": {
				"type": "custom",
				"tokenizer": "standard",
				"filter": [
					"lowercase",
					"trigrams_filter"
				]
			}
		}
	}
};

exports.mappings = {
	"company": {
		"properties": {
			"details" : {
				"properties": {
					"name":            {"type":"string", "analyzer":"trigrams"},
					"description":     {"type":"string", "analyzer":"trigrams"},
					"category" : {
						"properties": {
							"_id":     {"type":"string", "index":"no"},
							"name":    {"type":"string", "index":"not_analyzed"}
						}
					}
				}
			},
			"location" : {
				"properties": {
					"address" : {
						"properties": {
							"street" : {"type":"string", "index":"no"},
							"zip" :    {"type":"string", "index":"no"},
							"city" :   {"type":"string", "index":"no"},
							"state" :  {"type":"string", "index":"no"}
						}
					},
					"geocode": {"type": "geo_point"}
				}
			},
			"contacts": {
				"properties": {
					"email_address":   {"type":"string", "index":"no"},
					"web_site":        {"type":"string", "index":"no"},
					"skype":           {"type":"string", "index":"no"},
					"phone":           {"type":"string", "index":"no"},
					"mobile":          {"type":"string", "index":"no"},
					"facebook":        {"type":"string", "index":"no"},
					"twitter":         {"type":"string", "index":"no"},
					"instagram":       {"type":"string", "index":"no"},
					"web_site":        {"type":"string", "index":"no"}
				}
			},
			"last_modified_date":      {"type":"long", "index":"no"}
		}
	}
};
