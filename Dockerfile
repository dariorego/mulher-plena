FROM nginx:alpine

COPY dist/ /usr/share/nginx/html/plataforma/

COPY nginx.conf /etc/nginx/conf.d/default.conf
