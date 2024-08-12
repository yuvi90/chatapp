FROM node:20-alpine

# RUN addgroup app && adduser -S -G app app

# USER app

WORKDIR /app

COPY package.json package-lock.json ./

# USER root

# RUN chown -R app:app .

# USER app

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]