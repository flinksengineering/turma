# turma
Registry businesses api

Turma is a simple rest api. It has been created to manage registry businesses.
Turma lets you to make CRUD operations on:

	- Companies
	- Categories
	- Accounts
	- Clients
	
You can also:

	- Search companies by Geo Distance queries.
	
Turma REST API authorization is based on OAuth2 framework to enable applications to obtain limited access to user accounts on an HTTP service.

### Tech

Turma uses a number of open source projects to work properly:

* [node.js](https://nodejs.org/) - evented I/O for the backend
* [Express](http://expressjs.com//) - fast node.js network app framework 
* [Mongodb](https://github.com/mongodb/mongo) - nosql database
* [Elasticseach](https://www.elastic.co/products/elasticsearch) - fast search engine
* [Docker](https://www.docker.com/) -  build, ship, and run distributed applications
	

### Installation

Turma requires [Docker](https://www.docker.com/) to run.

Download and extract the [latest release](https://github.com/flinksengineering/turma).

To start the docker-compose:

```sh
$ dc turma
$ docker-compse up -d
```

To finish using Turma be sure to stop all running containers:

```sh
$ docker-compse stop
```

To remove old containers

```sh
$ docker-compse rm --all
```
