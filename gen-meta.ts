// 从游戏数据生成排行的关卡元数据（参考秒数 + 字数），供 Cloudflare Worker 校验用
import { allLevels } from './src/data/levels';
import { getPoemById } from './src/data/poems';
import * as fs from 'fs';

const meta: Record<number, { refSec: number; chars: number }> = {};
for (const lv of allLevels) {
  const poem = getPoemById(lv.poemId);
  if (!poem) throw new Error(`poem not found: ${lv.poemId}`);
  meta[lv.id] = { refSec: lv.starThresholds.three, chars: poem.charCount };
}

fs.writeFileSync(process.argv[2], JSON.stringify(meta));
console.log(`meta written: ${Object.keys(meta).length} levels -> ${process.argv[2]}`);
