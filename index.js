const Application = require('koa')
const { promisify, format } = require('util')
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const execFile = promisify(childProcess.execFile)
const readFile = promisify(fs.readFile)
const uuidV4 = require('uuid/v4')

const app = new Application()
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const route = require('koa-route');

app.use(session({ store: redisStore(), cookie: { signed: false } }));

app.use((ctx, next) => {
  console.log(ctx.method, ctx.path, ctx.session.authenticated)
  return next()
})

app.use(route.get(
  '/',
  async (ctx) => {
    const file = await readFile(path.join(__dirname, 'index.html'), { encoding: 'UTF-8' })

    ctx.body = file.replace('<!-- FUNDS -->', ctx.session.funds || 0)

    ctx.response.headers['content-type'] = 'text/html; charset=UTF-8'
  }
))

app.use(route.get(
  '/login',
  async (ctx) => {
    if (ctx.session.authenticated) {
      ctx.redirect('/')
      return
    }

    ctx.session.funds = 3000
    ctx.session.authenticated = true

    ctx.redirect('/')
  }
))

app.use(route.get(
  '/status',
  async (ctx) => {
    ctx.body = `Funds: ${ctx.session.funds}`
  }
))

app.use(route.get(
  '/transfer',
  async (ctx) => {
    const { amount, to } = ctx.query
    const { authenticated } = ctx.session
    const parsedAmount = Number.parseInt(amount)

    if (authenticated == null) return

    if (parsedAmount) ctx.session.funds -= parsedAmount

    await execFile('/usr/local/bin/terminal-notifier', [
      '-title',
      'Transferring money',
      '-message',
      `${amount}$ to ${to}`
    ])

    ctx.redirect('/')
  }
))

app.listen(8080, () => {
  console.log('Listening on port 8080')
})
