FROM node:24-slim

# Install Chromium and its dependencies from Debian repos.
# This gives us a fully-linked Chromium with all system libs (libnss3 etc.) included.
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-core \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./

EXPOSE 3000
CMD ["node", "index.js"]
