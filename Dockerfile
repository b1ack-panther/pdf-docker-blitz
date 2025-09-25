# Stage 1 - build
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Set default backend URL to backend service in docker-compose

ARG VITE_BACKEND_URL=http://backend:4000
ARG VITE_MEDIAMTX_URL=http://mediamtx:8889
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_MEDIAMTX_URL=$VITE_MEDIAMTX_URL


RUN npm run build

# Stage 2 - serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80