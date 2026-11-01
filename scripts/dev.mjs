#!/usr/bin/env node
/**
 * 跨环境开发服务器启动器
 *
 * 背景：某些运行环境（如 Kimi Work 的终端）PATH 里的 `node` 是脚本 shim，
 * Next.js 16 的 Turbopack 在编译 CSS 时需要直接 spawn 一个 node 可执行文件，
 * 找不到 .exe 会报 "spawning node pooled process - program not found"。
 *
 * 本脚本会优先把真实的 node.exe 目录放到 PATH 最前面，再用当前 node 启动
 * `next dev`，保证在任何环境下都能正常编译。
 *
 * 端口：默认 5001，可用环境变量 USER_PROJECT_PORT / PORT 或命令行参数覆盖，
 * 例如：npm run dev -- --port 7100
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Windows 下确保真实 node.exe 位于 PATH 首位
if (process.platform === 'win32') {
  const candidates = [
    process.env.REAL_NODE_DIR,
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'nodejs'),
    'C:\\Program Files\\nodejs',
  ];
  for (const dir of candidates) {
    if (dir && existsSync(path.join(dir, 'node.exe'))) {
      const pathLower = process.env.PATH.toLowerCase();
      if (!pathLower.startsWith(dir.toLowerCase())) {
        process.env.PATH = dir + ';' + process.env.PATH;
      }
      break;
    }
  }
}

const port = process.env.USER_PROJECT_PORT || process.env.PORT || '5001';
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
// 兼容调用方传入的参数：--host 是 --hostname 的常见别名（next CLI 只认后者）；
// 调用方显式传入的 host/port 优先，否则用默认值
const userArgs = process.argv.slice(2).map((a) => (a === '--host' ? '--hostname' : a));
const has = (name) => userArgs.includes(name) || userArgs.some((a) => a.startsWith(name + '='));
const args = [
  'dev',
  ...(has('--hostname') ? [] : ['--hostname', '0.0.0.0']),
  ...(has('--port') ? [] : ['--port', port]),
  ...userArgs,
];

const child = spawn(process.execPath, [nextBin, ...args], {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
