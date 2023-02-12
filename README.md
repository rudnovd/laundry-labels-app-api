# Laundry Labels App Api

API repository of [Laundry Labels App](https://github.com/rudnovd/laundry-labels-app).

## Development

1. Clone repository
1. Install [Nodejs](https://nodejs.org/en/download/)
1. Install npm dependencies: `npm install`
1. Copy .env-example and rename to .env: `cp .env-example .env`

### With Docker

1. Install [Docker Engine](https://docs.docker.com/engine/install/#server) and [Docker Compose](https://docs.docker.com/compose/install/)
1. Run containers: `docker compose -f docker-compose.dev.yml up`
1. Run server: `npm run dev`

### Without Docker

1. Install [MongoDB](https://docs.mongodb.com/manual/installation/) or get database from [Atlas](https://www.mongodb.com/atlas/database)
1. Install [Redis](https://redis.io/topics/quickstart) or get Redis store from [Redis Enterprise](https://redis.com/try-free/)
1. Run server: `npm run dev`
1. Fill MongoDB and Redis credentials in .env

```
DATABASE_URI=Address from Atlas
REDIS_URI=Address from Redis Enterprise
```

## Environment values

All environment values used by the server must be in the `.env` file

```
If you want to change the paths of user files, edit this value
# UPLOAD_PATH=/srv/laundrylabelsapp/

If you want to change the paths of the server log files, edit this value
# LOGS_PATH=/var/log/laundrylabelsapp/

Captcha key from https://www.hcaptcha.com, used for production server
# CAPTCHA_SECRET_KEY=CAPTCHA_KEY_from_hcaptcha.com

Letsencrypt credentials for creating SSL certificates, used with docker-compose.yml
# LETSENCRYPT_EMAIL=yourdomainemail@examle.com
# LETSENCRYPT_DOMAINS_LIST=example.com,www.example.com,api.example.com

# If you want to store user files in the cloud, register at https://cloudinary.com and fill API credentials
# IS_CLOUD_SERVER=true
# CLOUDINARY_CLOUD_NAME=CLOUD_NAME_from_cloudinary.com
# CLOUDINARY_API_KEY=CLOUD_API_KEY_from_cloudinary.com
# CLOUDINARY_API_SECRET=CLOUD_SECRET_from_cloudinary.com
```

## License

This project is licensed under the [GNU GPLv3 License](./LICENSE.md).
