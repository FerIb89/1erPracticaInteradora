
const express = require('express')
const app = express()
const handlebars = require('express-handlebars')
const { Server } = require('socket.io')
const { sockets, messages } = require('./sockets.js')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const { cartsRouter } = require('./routes/carts.routes.js')
const { productsRouter } = require('./routes/products.routes.js')
const { chatRouter } = require('./routes/chat.routes.js')

const { gestionProd } = require('./dao/fileSystem/ProductManager.js')
const { messageRoute } = require('./routes/message.routes.js')

let products = []

const fetchProducts = async () => {
    try {
        products = await gestionProd.getProducts()
    } catch (error) {
        console.error('Error: Producto no encontrado 😫')
        throw new Error(error)
    }
}
fetchProducts()

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT || 8080;

const httpServer = app.listen(PORT, () => console.log(`Escuchando en http://localhost:${PORT} 🛸`))

httpServer.on('error', (error) => console.log(`Error en el servidor ${error} 🔥`))


const socketServer = new Server(httpServer)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')

app.use(express.static('public'))

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/chat', chatRouter)
app.use('/messages', messageRoute)

// socketMessage = propaga los msj tanto localmente como desde mongoDB
app.post('/chat', (req, res) => {
    const { message } = req.body;
    socketServer.emit('message', message);

    res.send('ok');
});


app.get('/', async (req, res) => {
    res.status(200).render('home', { products: products })
})

app.get('/realtimeproducts', async (req, res) => {
    const products = await gestionProd.getProducts()
    res.status(200).render('realtimeproducts', { products: products })
})

sockets(socketServer)

app.get('/messages', (req, res) => {
    res.json(messages);
});


app.use((req, res, next) => {
    res.render("404")
})


const enviroment = async () => {
    try {
        await mongoose.connect(`mongodb+srv://fernandoibarra89:Coderbackend2024@cluster0.bwoxm59.mongodb.net/`,);
        console.log(`Conectado a MongoDB ✨ `)
    } catch (error) {
        console.error(`Error: error al conectar a mongoDB... ${error} ❌`)
        throw new Error(error)
    }

}
mongoose.set('strictQuery', false);

const isValidStartData = () => {
    return Boolean(DB_PASS && DB_USER)
};


isValidStartData && enviroment()

module.exports = {
    messages
}