FROM node:18-alpine AS builder
WORKDIR /app
ARG REACT_APP_BACKEND_HOST
RUN test -n "$REACT_APP_BACKEND_HOST" \
    || { echo "ERROR: --build-arg REACT_APP_BACKEND_HOST=https://... is required"; exit 1; }
ENV REACT_APP_BACKEND_HOST=$REACT_APP_BACKEND_HOST
ENV GENERATE_SOURCEMAP=false
COPY package*.json ./
RUN npm ci --silent --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
