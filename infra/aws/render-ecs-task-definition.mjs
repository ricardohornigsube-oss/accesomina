import fs from 'node:fs';
import path from 'node:path';

const input = process.env.ECS_TASK_TEMPLATE || 'infra/aws/ecs-task-definition.json';
const output = process.env.ECS_TASK_OUTPUT || 'infra/aws/ecs-task-definition.rendered.json';
const accountId = process.env.AWS_ACCOUNT_ID || '';
const imageTag = process.env.ECR_IMAGE_TAG || 'preflight';
const region = process.env.AWS_REGION || 'us-east-1';

if (!/^\d{12}$/.test(accountId)) {
  throw new Error('AWS_ACCOUNT_ID must contain the 12-digit AWS account identifier.');
}
if (!/^[A-Za-z0-9._-]+$/.test(imageTag)) {
  throw new Error('ECR_IMAGE_TAG may only contain letters, numbers, dots, underscores and hyphens.');
}

const source = fs.readFileSync(input, 'utf8');
const rendered = source
  .replaceAll('<account-id>', accountId)
  .replaceAll('<image-tag>', imageTag)
  .replaceAll('us-east-1', region);

if (/<[^>]+>/.test(rendered)) throw new Error('The rendered ECS task definition still contains unresolved placeholders.');
JSON.parse(rendered);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${rendered}\n`);
console.log(`Rendered ECS task definition: ${output}`);
