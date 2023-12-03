FROM node:12.2.0-alpine as build
WORKDIR /digfront
ENV PATH /digfront/node_modules/.bin:$PATH
COPY ./package.json /digfront/package.json
RUN npm install
RUN npm install @vue/cli@3.7.0 -g --silent
COPY ./ /digfront
RUN npm run build

# production environment
FROM nginx:1.25.2-alpine
COPY --from=build /digfront/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
COPY nginx/certs /etc/ssl
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
