import mimeType from "mime-types";
import sizeOf from "image-size";
import path from "path";
import fs from "fs";

export const themePath = path.resolve(__dirname, "../../assets/theme");
export const themeList: Record<
  string,
  Record<string, { width: number; height: number; data: string }>
> = {};

export const convertToDatauri = (path: string) => {
  const mime = mimeType.lookup(path);
  const base64 = fs.readFileSync(path).toString("base64");

  return `data:${mime};base64,${base64}`;
};

fs.readdirSync(themePath).forEach((theme) => {
  if (!(theme in themeList)) themeList[theme] = {};
  const imgList = fs.readdirSync(path.resolve(themePath, theme));
  imgList.forEach((img) => {
    const imgPath = path.resolve(themePath, theme, img);
    const name = path.parse(img).name;
    const { width, height } = sizeOf(imgPath);

    themeList[theme][name] = {
      width: width ?? 0,
      height: height ?? 0,
      data: convertToDatauri(imgPath),
    };
  });
});

export const getCountImage = ({
  count,
  theme = "moebooru",
  length = 7,
}: {
  count: number;
  theme: string;
  length: number;
}): string => {
  if (!(theme in themeList)) theme = "moebooru";

  // This is not the greatest way for generating an SVG but it'll do for now
  const countArray = count.toString().padStart(length, "0").split("");

  let x = 0,
    y = 0;

  const parts = countArray.reduce((acc, next) => {
    const { width, height, data } = themeList[theme][next];

    const image = `${acc}
      <image x="${x}" y="0" width="${width}" height="${height}" xlink:href="${data}" />`;

    x += width;

    if (height > y) y = height;

    return image;
  }, "");

  return `<?xml version="1.0" encoding="UTF-8"?><svg width="${x}" height="${y}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>${count}</title><g>${parts}</g></svg>`;
};
