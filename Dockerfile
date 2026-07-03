FROM node:22-alpine

WORKDIR /app
COPY package.json server.js index.html styles.css app.js ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8090

EXPOSE 8090
CMD ["node", "server.js"]
