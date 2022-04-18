const mongoose = require('mongoose')
const express = require('express')

const app = express()
app.use(express.json())

let router
async function setupRouter (list) {
  router = new express.Router()
  for(let index = 0; list.length >= index; index++) {
    let urlText = await list[index]
    if(urlText) {
      router.get(`/${list[index].urlText}/`, (req, res) => {
        res.send(`
          If not redirected allows you javascript
          <script>window.location.href = "${list[index].url}"</script>`)
      })
    }
  }
}

await mongoose.connect('mongodb+srv://florest:senha12345678@cluster0.gwzaf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true')

const urlSchema = 
({
  "url": {
    "type": String,
    "require": true
  },
  "urlText": {
    "type": String,
    "require": true
  }
})
  
mongoose.model('encurtador', urlSchema)
  
const shortUrl = mongoose.model('encurtador')

app.get('/', (req, res) => {
  res.send(`
<html>
  <head>
    <title>Encurte suas urls</title>
  </head>

  <body>
    <h1 id='resp'>Resposta : </h1>
    <input id="textUrl" type="text" placeholder="Texto da url"/>
    <input id="url" type="text" placeholder="Url"/>
    <button id='send' onclick="sendRequest()">ENVIAR</button>
    <script type="text/javascript">
      var url = document.getElementById("url")
      var urlText = document.getElementById("textUrl")

      function sendRequest() {
        fetch("https://encurtadordhanielb.vercel.app", {
          method: 'POST',
          body: {url: url.value, urlText: urlText.value}
        })
        .then((response) => {
          document.getElementById("resp").innerHTML = 'Resposta : '+response.data
        })
      }
      document.getElementById('send').addEventListener('click', sendRequest)
    </script>
  </body>
    `)
})
app.post('/', (req, res) => {
  try {
    var url = req.body.url
    var urlText = req.body.urlText
      
    shortUrl({
      url,
      urlText
    }).save()

    .then(() => {
      const shortUrls = shortUrl.find({}, async (err, response) => {
        if(err) {
          throw err
        }
        const response_confirm = await response
        setupRouter(response_confirm)
      })
      res.json({messagem: 'Link criado com sucesso! https://encurtador.dhanielb.repl.co/'+urlText+'/'})
    })

    .catch((err) => {
       res.json({erro: err})
    })
  }catch(err) {
    res.json({erro: err})
  }
})

app.use(function replaceableRouter (req, res, next) {
  router(req, res, next)
})

app.listen(3000)
