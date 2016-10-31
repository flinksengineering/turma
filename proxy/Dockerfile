FROM nginx:1.10
COPY default.conf /etc/nginx/conf.d/default.conf
COPY certs/cert.pem /usr/local/nginx/conf/cert.pem
COPY certs/private-key.pem /usr/local/nginx/conf/key.pem
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
