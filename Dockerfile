FROM node:lts
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY tsconfig*.json .eslintrc.js .prettierrc.js ./
COPY src/ src/
COPY public/ public/
RUN ls -ln node_modules
RUN npm run client:build
RUN npm prune --production
ENTRYPOINT ["npm", "run", "server:start:prod"]
