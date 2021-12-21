FROM node:12.18.4
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 80
CMD ["node","app.js"]

