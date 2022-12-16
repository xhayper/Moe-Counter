FROM node:19-bullseye as development

ENV NODE_ENV=${NODE_ENV:-development}
ENV YARN_VERSION=3.3.0

ENV DATABASE_URL=${DATABASE_URL:-file:/usr/src/app/database.sqlite3}
ENV PORT=${PORT:-3000}

WORKDIR /usr/src/app

COPY ["package.json", ".yarnrc.yml", "yarn.lock", "./"]
COPY .yarn/plugins /usr/src/app/.yarn/plugins
COPY .yarn/releases /usr/src/app/.yarn/releases

RUN yarn install

COPY . .

RUN npx prisma generate
RUN npx prisma migrate dev --name init

RUN yarn run build

################################################

FROM node:19-bullseye as production

ENV NODE_ENV=production
ENV YARN_VERSION=3.3.0

ENV DATABASE_URL=${DATABASE_URL:-file:/usr/src/app/database.sqlite3}
ENV PORT=${PORT:-3000}

WORKDIR /usr/src/app

COPY ["package.json", ".yarnrc.yml", "./"]
COPY .yarn/plugins /usr/src/app/.yarn/plugins
COPY .yarn/releases /usr/src/app/.yarn/releases

COPY --from=development /usr/src/app/yarn.lock ./yarn.lock

RUN yarn install --immutable

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/assets ./assets
COPY --from=development /usr/src/app/prisma ./prisma

RUN npx prisma generate
RUN npx prisma migrate dev --name init

CMD ["node", "dist/index.js"]