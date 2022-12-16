import 'dotenv/config';

import fastify, { type RouteShorthandOptions } from 'fastify';
import { getCountImage, themeList } from './utils/themify';
import svg2Img, { type svg2imgOptions } from 'svg2img';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';
import util from 'node:util';

(async () => {
  const prisma = new PrismaClient();

  const svg2ImgPromise = util.promisify<string, svg2imgOptions | undefined, Buffer>(svg2Img);

  const server = fastify({
    logger: {
      transport: {
        target: '@fastify/one-line-logger'
      }
    }
  });

  await server.register(import('@fastify/static'), {
    root: path.join(__dirname, '../assets')
  });

  await server.register(import('@fastify/compress'));

  type ImageOption = {
    theme: string;
    length: number;
    pixelated: boolean;
    format: 'png' | 'svg';
  };

  const customizationOption: RouteShorthandOptions = {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            enum: Object.keys(themeList)
          },
          length: {
            type: 'number',
            minimum: 1,
            maximum: 12
          },
          pixelated: {
            type: 'boolean'
          },
          format: {
            type: 'string',
            enum: ['png', 'svg']
          }
        },
        additionalProperties: false
      }
    }
  };

  const cache: Map<string, Buffer> = new Map();

  setInterval(() => void cache.clear(), 3600 * 1000);

  server.get('/count/:identifier', customizationOption, async (req, res) => {
    const { identifier } = req.params as any;
    let { theme, length, pixelated, format } = req.query as ImageOption;

    theme = theme ?? 'moebooru';
    length = parseInt((length as unknown as string) ?? '7');

    if (!identifier || identifier.length > 256) {
      res.code(400);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid identifier'
      };
    }

    res.header('Content-Type', format === 'png' ? 'image/png' : 'image/svg+xml');

    let count: string | number = 0;
    if (identifier !== 'demo') {
      res.header('Cache-Control', 'max-age=0, no-cache, no-store, must-revalidate');

      let CountData = await prisma.count.findFirst({
        where: {
          identifier
        }
      });

      if (!CountData)
        CountData = await prisma.count.create({
          data: {
            identifier
          }
        });

      if (Number.MAX_SAFE_INTEGER > CountData.count) count = CountData.count + 1;

      if (CountData.count !== count)
        await prisma.count.update({
          where: {
            identifier
          },
          data: {
            count
          }
        });

      const { data } = getCountImage({ count, theme, length, pixelated });

      return format === 'png' ? await svg2ImgPromise(data, { format: 'png' as any, quality: 100 }) : data;
    } else {
      res.header('Cache-Control', 'public, max-age=604800, immutable');
      res.header('Expires', new Date(Date.now() + 604800 * 1000).toUTCString());

      count = '1234567890';

      const cacheKey = `${count}${theme}${length}${!!pixelated}${format ?? 'svg'}`;

      const cachedData = cache.get(cacheKey);
      if (cachedData) return cachedData;

      const { data } = getCountImage({ count, theme, length, pixelated });
      const transformedData =
        format === 'png' ? await svg2ImgPromise(data, { format: 'png' as any, quality: 100 }) : Buffer.from(data);
      cache.set(cacheKey, transformedData);

      return transformedData;
    }
  });

  server.get('/number/:amount', customizationOption, async (req, res) => {
    console.log(cache);

    res.header('Cache-Control', 'public, max-age=604800, immutable');
    res.header('Expires', new Date(Date.now() + 604800 * 1000).toUTCString());

    let { amount } = req.params as any;
    let { theme, length, pixelated, format } = req.query as ImageOption;

    if (amount.length > 16) {
      res.code(400);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'number length must be <= 32'
      };
    }

    theme = theme ?? 'moebooru';
    length = parseInt((length as unknown as string) ?? '7');
    amount = parseInt(amount);

    if (!amount || 0 > amount) {
      res.code(400);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'number must be a valid positive integer'
      };
    }

    res.header('Content-Type', format === 'png' ? 'image/png' : 'image/svg+xml');

    const cacheKey = `${amount}${theme}${length}${!!pixelated}${format ?? 'svg'}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    const { data } = getCountImage({ count: amount, theme, length, pixelated });
    const transformedData =
      format === 'png' ? await svg2ImgPromise(data, { format: 'png' as any, quality: 100 }) : Buffer.from(data);
    cache.set(cacheKey, transformedData);

    return transformedData;
  });

  server.get('/heart-beat', () => 'alive');

  server.listen({
    host: process.env.HOST ?? '0.0.0.0',
    port: parseInt(process.env.PORT ?? '3000')
  });
})();
