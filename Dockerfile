# root/Dockerfile (for probot)
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["npx", "probot", "run", "./index.js"]
