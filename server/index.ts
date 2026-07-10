import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const { createApp } = await import('./src/app.ts')

const app = createApp()
const port = Number(process.env.PORT ?? 5000)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
