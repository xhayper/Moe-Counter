import mimeType from 'mime-types';
import sizeOf from 'image-size';
import path from 'node:path';
import fs from 'node:fs';

export const themePath = path.resolve(__dirname, '../../assets/theme');
export const themeList: Record<string, Record<string, { width: number; height: number; data: string }>> = {};

export const convertToDatauri = (path: string) => {
  const mime = mimeType.lookup(path);
  const base64 = fs.readFileSync(path).toString('base64');

  return `data:${mime};charset=utf-8;base64,${base64}`;
};

fs.readdirSync(themePath).forEach((theme) => {
  if (!(theme in themeList)) themeList[theme] = {};

  const imgList = fs.readdirSync(path.resolve(themePath, theme));

  for (const img of imgList) {
    const imgPath = path.resolve(themePath, theme, img);
    const { width, height } = sizeOf(imgPath);
    const name = path.parse(img).name;

    themeList[theme][name] = {
      width: width ?? 0,
      height: height ?? 0,
      data: convertToDatauri(imgPath)
    };
  }
});

export const getCountImage = ({
  count,
  theme = 'moebooru',
  length = 7,
  pixelated = true
}: {
  count: number | string;
  theme?: string;
  length?: number;
  pixelated?: boolean;
}): { data: string; width: number; height: number } => {
  if (!(theme in themeList)) theme = 'moebooru';

  const countArray = count.toString().padStart(length, '0').split('');

  let x = 0;
  let y = 0;
  let parts = '';

  for (const num of countArray) {
    const { width, height, data } = themeList[theme][num];

    parts += `<image x="${x}" y="0" width="${width}" height="${height}" href="${data}" />`;

    x += width;
    y = Math.max(y, height);
  }

  return {
    data: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${x}" height="${y}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${
      pixelated ? "style='image-rendering: pixelated;'" : ''
    }>
  <title>${count}</title>
  <g>${parts}</g>
</svg>`,
    width: x,
    height: y
  };
};
