# Stage 1: Build Node.js package
FROM node

#ENV http_proxy="http://172.20.1.224:5432"
#ENV https_proxy="http://172.20.1.224:5432"

#RUN apk add --no-cache curl \
# && curl -o- -L https://yarnpkg.com/install.sh | sh \
# && apk del curl

ENV PATH="/root/.yarn/bin:/root/.config/yarn/global/node_modules/.bin:${PATH}"

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install

COPY . .

RUN npx prisma generate
RUN yarn build
EXPOSE 3032

CMD ["yarn", "start"]
