import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const outDir = path.join(os.tmpdir(), "dragon-audio-placeholders");
fs.mkdirSync(outDir, { recursive: true });

writeWav(path.join(outDir, "fire-breath.wav"), makeFireBreath(1.1, 44100), 44100);

console.log(outDir);

function makeFireBreath(seconds, sampleRate) {
  const frames = Math.floor(seconds * sampleRate);
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  let noiseState = 0x12345678;
  for (let i = 0; i < frames; i += 1) {
    const t = i / sampleRate;
    const p = i / frames;
    noiseState ^= noiseState << 13;
    noiseState ^= noiseState >>> 17;
    noiseState ^= noiseState << 5;
    const noise = ((noiseState >>> 0) / 0xffffffff) * 2 - 1;
    const envelope = Math.sin(Math.PI * Math.min(1, p * 1.4)) * (1 - p * 0.58);
    const rumble = Math.sin(2 * Math.PI * (120 + 260 * p) * t) * 0.22;
    const sample = (noise * 0.5 + rumble) * envelope * 0.55;
    left[i] += sample;
    right[i] += sample * 0.92;
  }
  fadeEdges(left, right, sampleRate, 0.035);
  return [left, right];
}

function fadeEdges(left, right, sampleRate, seconds) {
  const frames = Math.floor(seconds * sampleRate);
  for (let i = 0; i < frames; i += 1) {
    const gain = i / frames;
    const end = left.length - 1 - i;
    left[i] *= gain;
    right[i] *= gain;
    left[end] *= gain;
    right[end] *= gain;
  }
  normalize(left, right, 0.82);
}

function normalize(left, right, peak) {
  let max = 0.0001;
  for (let i = 0; i < left.length; i += 1) {
    max = Math.max(max, Math.abs(left[i]), Math.abs(right[i]));
  }
  const scale = peak / max;
  for (let i = 0; i < left.length; i += 1) {
    left[i] *= scale;
    right[i] *= scale;
  }
}

function writeWav(filePath, channels, sampleRate) {
  const channelCount = channels.length;
  const frames = channels[0].length;
  const dataSize = frames * channelCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channelCount * 2, 28);
  buffer.writeUInt16LE(channelCount * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      buffer.writeInt16LE(Math.round(sample * 32767), offset);
      offset += 2;
    }
  }
  fs.writeFileSync(filePath, buffer);
}
