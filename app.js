require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
const { spawn } = require("child_process");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", (req, res) => {
  res.sendFile(__dirname + "/greetings.html");
  console.log("Python execution started");
  const python = spawn("python", [
    "mashup.py",
    req.body.artist,
    req.body.songs,
    req.body.time,
    "output.mp3",
  ]);
  console.log("Python execution completed!");
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USERNAME,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    },
  });
  const mailOptions = {
    from: process.env.MAIL,
    to: req.body.email,
    subject: "Your mashup is here!",
    attachments: [
      {
        filename: "output.zip",
        path: "output.zip",
      },
    ],
  };
  python.on("close", () => {
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.log("yes i am here");
        return res.status(500).send(error.message);
      } else {
        console.log("Mail sent!");
      }
    });
  });
});

app.listen(port, () => console.log("Server started on port 3000"));
