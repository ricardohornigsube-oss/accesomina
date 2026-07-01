FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY . .
ENV NODE_ENV=production
EXPOSE 8088
CMD ["sh", "-c", "pnpm run migrate && pnpm start"]
