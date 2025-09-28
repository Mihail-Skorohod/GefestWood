import express from "express"
import https from "https"
import fs from "fs"
import twilio from "twilio"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const app = express()
app.use(cors()) // Додаємо middleware CORS
app.use(express.json())

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = twilio(accountSid, authToken)

app.post("/send-sms", (req, res) => {
  const { to, body } = req.body

  client.messages
    .create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    })
    .then((message) => {
      console.log(message.sid)
      res.json({ success: true })
    })
    .catch((error) => {
      console.error("Error:", error)
      res.status(500).json({ success: false, error: error.message })
    })
})

// Serve static files
app.use(express.static("public"))

const PORT = process.env.PORT || 443 // HTTPS default port

// SSL certificate options
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/yourdomain.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/yourdomain.com/fullchain.pem"),
}

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`)
})

// Redirect from HTTP to HTTPS
import http from "http"
http
  .createServer((req, res) => {
    res.writeHead(301, { Location: "https://" + req.headers["host"] + req.url })
    res.end()
  })
  .listen(80)

