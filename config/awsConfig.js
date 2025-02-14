require('dotenv').config();
const AWS = require('aws-sdk');

console.log("Region:",'process.env.AWS_REGION'); // Ensure the region is being loaded correctly
console.log("AccessKeyId:",'process.env.AWS_ACCESS_KEY_ID'); // Check if access keys are set
console.log("SecretAccessKey:",'process.env.AWS_SECRET_ACCESS_KEY'); // Check if secret keys are set

AWS.config.update({
  region:process.env.AWS_REGION || 'ap-south-1',
  accessKeyId:'process.env.AWS_ACCESS_KEY_ID',
  secretAccessKey:'process.env.AWS_SECRET_ACCESS_KEY'
});

const athena = new AWS.Athena();


