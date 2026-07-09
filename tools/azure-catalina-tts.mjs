import 'dotenv/config';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith('--')) continue;
  const key = arg.slice(2);
  const value = process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : 'true';
  args.set(key, value);
}

const textFile = args.get('text-file');
const inlineText = args.get('text');
const outputFile = args.get('out') || 'outputs/voz_catalina_es_cl.mp3';
const region = args.get('region') || process.env.AZURE_SPEECH_REGION || 'chilecentral';
const voice = args.get('voice') || process.env.AZURE_SPEECH_VOICE || 'es-CL-CatalinaNeural';
const rate = args.get('rate') || process.env.AZURE_SPEECH_RATE || '+50%';
const key = process.env.AZURE_SPEECH_KEY;

if (!key) {
  console.error('Falta AZURE_SPEECH_KEY en .env. Cree el recurso Azure Speech y pegue la clave antes de generar la voz.');
  process.exit(1);
}

if (!textFile && !inlineText) {
  console.error('Uso: node tools/azure-catalina-tts.mjs --text-file guion.txt --out outputs/audio.mp3');
  process.exit(1);
}

const text = inlineText || await readFile(resolve(textFile), 'utf8');
const safeText = text
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const ssml = `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xml:lang="es-CL">
  <voice name="${voice}">
    <prosody rate="${rate}">
      ${safeText}
    </prosody>
  </voice>
</speak>`;

const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
  method: 'POST',
  headers: {
    'Ocp-Apim-Subscription-Key': key,
    'Content-Type': 'application/ssml+xml',
    'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
    'User-Agent': 'domian-nexo-video-generator'
  },
  body: ssml
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Azure Speech rechazo la solicitud (${response.status}): ${body}`);
  process.exit(1);
}

const audio = Buffer.from(await response.arrayBuffer());
const target = resolve(outputFile);
await mkdir(dirname(target), { recursive: true });
await writeFile(target, audio);

console.log(`Audio generado con ${voice} (${rate}): ${target}`);
