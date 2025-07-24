FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --force

COPY . .

RUN npm run build

ENV PORT =8000
EXPOSE 8000

CMD [ "npm", "run", "start:dev" ]