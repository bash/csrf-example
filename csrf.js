if (ctx.session.csrfToken !== ctx.query['csrf-token']) {
    await execFile('/usr/local/bin/terminal-notifier', [
        '-message',
        `Ha! You failed!`
    ])

    return
}


ctx.body = file.replace('<!-- CSRF_TOKEN -->', `<input type="hidden" name="csrf-token" value="${ctx.session.csrfToken}">`)


app.use((ctx, next) => {
    ctx.session.csrfToken = ctx.session.csrfToken || uuidV4()
    return next()
})


// < !--CSRF_TOKEN -->