FROM node:lts

WORKDIR /app

COPY package*.json ./

RUN npm install

# FROM node:lts as RUNNER

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# COPY --from=BUILDER /app/next.config.js .
# COPY --from=BUILDER /app/package.json .
# COPY --from=BUILDER /app/public ./public
# COPY --from=BUILDER /app/.next ./.next
COPY . .

ENV NODE_ENV=PRODUCTION
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/google-chrome-stable

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
