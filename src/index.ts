import fastify, { type RouteShorthandOptions } from "fastify";
import { getCountImage, themeList } from "./utils/themify";
import { PrismaClient } from "@prisma/client";
import path from "path";

(async () => {
  const prisma = new PrismaClient();

  const server = fastify({ logger: true });

  await server.register(import("@fastify/static"), {
    root: path.join(__dirname, "../assets"),
  });

  await server.register(import("@fastify/compress"));

  const countOptions: RouteShorthandOptions = {
    schema: {
      querystring: {
        type: "object",
        required: ["theme"],
        properties: {
          theme: {
            type: "string",
            enum: Object.keys(themeList),
          },
        },
      },
    },
  };

  const PLACES = 7;

  server.get("/count/:identifier", countOptions, async (req, res) => {
    const { identifier } = req.params as any;
    const { theme } = req.query as any;

    if (!identifier || identifier.length > 32) {
      res.code(400);
      return {
        statusCode: 400,
        error: "Bad Request",
        message: "Invalid identifier",
      };
    }

    res.header("content-type", "image/svg+xml");
    res.header(
      "cache-control",
      "max-age=0, no-cache, no-store, must-revalidate"
    );

    let count = 0;

    if (identifier !== "demo") {
      let CountData = await prisma.count.findFirst({
        where: {
          identifier,
        },
      });

      if (!CountData)
        CountData = await prisma.count.create({
          data: {
            identifier,
          },
        });

      count = CountData.count + 1;

      await prisma.count.update({
        where: {
          identifier,
        },
        data: {
          count,
        },
      });
    } else {
      count = 1234567890;
    }

    return getCountImage({ count, theme, length: 7 });
  });

  // const app = express();

  // app.use(express.static("assets"));
  // app.use(compression());
  // app.set("view engine", "pug");

  // app.get("/", (req, res) => {
  //   res.render("index");
  // });

  // get the image
  // app.get("/get/@:name", async (req, res) => {
  //   const { name } = req.params;
  //   const { theme = "moebooru" } = req.query;
  //   let length = PLACES;

  //   // This helps with GitHub's image cache
  //   res.set({
  //     "content-type": "image/svg+xml",
  //     "cache-control": "max-age=0, no-cache, no-store, must-revalidate",
  //   });

  //   const data = await getCountByName(name);

  //   if (name === "demo") {
  //     res.set({
  //       "cache-control": "max-age=31536000",
  //     });
  //     length = 10;
  //   }

  //   // Send the generated SVG as the result
  //   const renderSvg = themify.getCountImage({ count: data.num, theme, length });
  //   res.send(renderSvg);

  //   console.log(data, `theme: ${theme}`);
  // });

  // JSON record
  // app.get("/record/@:name", async (req, res) => {
  //   const { name } = req.params;

  //   const data = await getCountByName(name);

  //   res.json(data);
  // });

  // app.get("/heart-beat", (req, res) => {
  //   res.set({
  //     "cache-control": "max-age=0, no-cache, no-store, must-revalidate",
  //   });

  //   res.send("alive");
  //   console.log("heart-beat");
  // });

  // async function getCountByName(name) {
  //   const defaultCount = { name, num: 0 };

  //   if (name === "demo") return { name, num: "0123456789" };

  //   try {
  //     const counter = (await db.getNum(name)) || defaultCount;
  //     const num = counter.num + 1;
  //     db.setNum(counter.name, num);
  //     return counter;
  //   } catch (error) {
  //     console.log("get count by name is error: ", error);
  //     return defaultCount;
  //   }
  // }

  server.listen({ port: 3000 }, (err) => {});
})();
