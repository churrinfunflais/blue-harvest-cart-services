FROM node:slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build
EXPOSE 8080
ENTRYPOINT ["npm","run","start"]
