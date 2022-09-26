# Serverless Game
## Quick start
1. `nvm use`
2. `npm ci`
3. `npm start`

## Deployment
1. Required environment variables:
   1. `AWS_ACCESS_KEY_ID` - id of SA which will be used for creating/updating resources in cloud 
   2. `AWS_SECRET_ACCESS_KEY` - static key of SA which will be used for creating/updating resources in cloud
   3. `LOCKBOX_SECRET_ID` - id of Lockbox secret, where secrets are stored
   4. `YC_CLOUD_ID` - id of cloud, where all services will be deployed to
   5. `YC_FOLDER_ID` - id of folder, where all services will be deployed to
   6. `YC_IAM_TOKEN` - iam token of SA which will be used for creating/updating resources in cloud
   7. `APP_ENV` (`production`/`development`) - build mode (code minification, ...)
2. `npm run build`
3. `npm run deploy`
