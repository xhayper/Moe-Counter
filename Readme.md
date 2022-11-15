# Moe-counter

多种风格可选的萌萌计数器

![Moe-counter](https://Moe-counter.hayper.repl.co/count/Moe-counter.github)

<details>
<summary>More theme</summary>

##### asoul
![asoul](https://Moe-counter.hayper.repl.co/count/demo?theme=asoul)

##### moebooru
![moebooru](https://Moe-counter.hayper.repl.co/count/demo?theme=moebooru)

##### rule34
![Rule34](https://Moe-counter.hayper.repl.co/count/demo?theme=rule34)

##### gelbooru
![Gelbooru](https://Moe-counter.hayper.repl.co/count/demo?theme=gelbooru)

##### e621
![e621](https://Moe-counter.hayper.repl.co/count/demo?theme=e621)
</details>

## Demo
[https://Moe-counter.hayper.repl.co/](https://Moe-counter.hayper.repl.co/)

## Usage

### Install

#### Deploying on your own server

```shell
$ git clone https://github.com/xhayper/Moe-counter.git -b fork
$ cd Moe-counter
$ yarn
$ npx prisma generate
$ npx prisma migrate dev --name init
$ tsc
$ node .
```

### Configuration

`.env`

```env
# URL to database
# use `file:` for sqlite database
DATABASE_URL=
```

`prisma/schema.prisma`

```prisma
// ...
datasource db {
  // sqlite, postgresql, mysql, sqlserver, mongodb or cockroachdb.
  provider = "sqlite"
// ...
```

## Credits

*   [repl.it](https://repl.it/)
*   [A-SOUL](https://www.asoulworld.com/) <sup>(非官方导航站)</sup>
*   [moebooru](https://github.com/moebooru/moebooru)
*   rule34.xxx NSFW
*   gelbooru.com NSFW
*   e621.net NSFW
*   [Icons8](https://icons8.com/icons/set/star)

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fxhayper%2FMoe-counter.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fxhayper%2FMoe-counter?ref=badge_large)
