import 'dotenv/config';

import fastify, { type RouteShorthandOptions } from 'fastify';
import { getCountImage, themeList } from './utils/themify';
import { PrismaClient } from '@prisma/client';
import path from 'node:path';

(async () => {
  const prisma = new PrismaClient();

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
          }
        },
        additionalProperties: false
      }
    }
  };

  server.get('/count/:identifier', customizationOption, async (req, res) => {
    const { identifier } = req.params as any;
    let { theme, length, pixelated } = req.query as any;

    theme = theme ?? 'moebooru';
    length = parseInt(length ?? '7');

    if (!identifier || identifier.length > 256) {
      res.code(400);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid identifier'
      };
    }

    let count: string | number = 0;
    if (identifier !== 'demo') {
      res.header('cache-control', 'max-age=0, no-cache, no-store, must-revalidate');

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
    } else {
      count = '1234567890';
    }

    res.header('content-type', 'image/svg+xml');
    return getCountImage({ count, theme, length, pixelated });
  });

  server.get('/number/:amount', customizationOption, async (req, res) => {
    let { amount } = req.params as any;
    let { theme, length, pixelated } = req.query as any;

    if (amount.length > 16) {
      res.code(400);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'number length must be <= 32'
      };
    }

    theme = theme ?? 'moebooru';
    length = parseInt(length ?? '7');
    amount = parseInt(amount);

    if (!amount || 0 > amount) {
      res.code(400);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'number must be a valid positive integer'
      };
    }

    res.header('content-type', 'image/svg+xml');
    return getCountImage({ count: amount, theme, length, pixelated });
  });

  server.get('/heart-beat', () => 'alive');

  server.listen({
    host: process.env.HOST ?? '0.0.0.0',
    port: parseInt(process.env.PORT ?? '3000')
  });
})();
