# Moe-counter

多种风格可选的萌萌计数器

![Moe-counter](https://moe-counter.hayper.repl.co/count/Moe-counter.github)

<details>
<summary>More theme</summary>

##### asoul
![asoul](https://moe-counter.hayper.repl.co/count/demo?theme=asoul)

##### moebooru
![moebooru](https://moe-counter.hayper.repl.co/count/demo?theme=moebooru)

##### rule34
![Rule34](https://moe-counter.hayper.repl.co/count/demo?theme=rule34)

##### gelbooru
![Gelbooru](https://moe-counter.hayper.repl.co/count/demo?theme=gelbooru)

##### e621
![e621](https://moe-counter.hayper.repl.co/count/demo?theme=e621)

  <details>
    <summary>NSFW</summary>

##### moebooru-h

##### gelbooru-h
  </details>
</details>

## Demo
[https://moe-counter.hayper.repl.co/](https://moe-counter.hayper.repl.co/)

## Usage

### Install

#### Deploying on your own server

```shell
$ git clone https://github.com/xhayper/Moe-counter.git
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
*   [journey-ad](https://github.com/journey-ad/)

## License

[MIT](LICENSE)
