const Application = require('koa')
const { promisify, format } = require('util')
const childProcess = require('child_process')
const execFile = promisify(childProcess.execFile)

const app = new Application()

app.use(async (ctx) => {
  console.log(ctx.method, ctx.path, ctx.cookies.get('cookie'))
  
  if (ctx.path === '/set-cookie') {
    ctx.cookies.set('cookie', 'yum yum')

    ctx.body = 'hello world (cookie has been set)'
  } else {
    ctx.body = 'hello world'
  }

  if (ctx.path !== '/' && ctx.path !== '/set-cookie') {
    await execFile('/usr/local/bin/terminal-notifier', [
      '-message',
      format(ctx.method, ctx.path, ctx.cookies.get('cookie'))
    ])
  }  
})


app.listen(8080)
