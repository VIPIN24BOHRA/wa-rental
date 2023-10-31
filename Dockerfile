FROM node:18.12.0

ARG NODE_ENV=staging
RUN echo "building for $NODE_ENV environment"

RUN useradd --user-group --create-home --shell /bin/false app && npm install --global pm2 npm
ENV HOME=/home/app

COPY . $HOME/workspace
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/workspace
RUN npm install
RUN npm run build

USER app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD pm2-runtime start pm2.json --env production