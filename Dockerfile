FROM node:14

WORKDIR /user/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


EXPOSE 3000
CMD ["npm", "run", "start"]