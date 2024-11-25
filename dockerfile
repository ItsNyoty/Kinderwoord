FROM node:20.17.0-alpine
WORKDIR /webapp
COPY . .
RUN yarn install 
CMD ["yarn","start"]
EXPOSE 3000