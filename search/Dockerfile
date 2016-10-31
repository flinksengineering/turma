FROM node:argon
RUN mkdir /src
WORKDIR /src
COPY package.json /src/
RUN npm install
COPY . /src
CMD ["node", "service", "--seneca.options.tag=search", "--seneca-log=type:act"]
