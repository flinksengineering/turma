FROM node:argon
RUN mkdir /src
ADD package.json /src/
WORKDIR /src
RUN npm install
COPY . /src
CMD ["node", "service", "--seneca.options.tag=api", "--seneca-log=type:act"]
