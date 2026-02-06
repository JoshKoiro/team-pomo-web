FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Create directory for persistent config (API Key)
RUN mkdir -p config

# Expose the web port
EXPOSE 5000

CMD ["npm", "start"]