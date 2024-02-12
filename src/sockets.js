const { gestionProd } = require('./dao/fileSystem/ProductManager.js')
const { messageModel } = require('./dao/models/messages.model.js')

const messages = []

const sockets = (socketServer) => {
    let addedProducts = []

    socketServer.on('connection', async (socket) => {
        console.log("Usuario conectado 💻");
        socket.on('productReceived', async (data) => {
            await gestionProd.addProduct(data)
            addedProducts.push(data)
            socketServer.emit('addedProducts', addedProducts)
        });

        socket.on('productDelete', async (data) => {
            const products = await gestionProd.getProducts()
            const productDelete = products.find(p => p.code === data)
            if (!Boolean(productDelete)) {
                console.error('Error: Producto no encontrado 🙁')
                return
            }
            await gestionProd.deleteProduct(productDelete.id)
        });

        socket.on("disconnect", () => {
            console.log("Usuario desconectado 👋")
        })

        socket.on('new-user', (data) => {
            socket.user = data.user;
            socket.id = data.id;
            socketServer.emit('new-user-connected', {
                user: socket.user,
                id: socket.id,
            });
        });

        socket.on('message', (data) => {
            console.log('recibe data?', data)
            messages.push(data);
            socketServer.emit('messageLogs', messages)
            messageModel.create(data)
        });
    });
};

module.exports = {
    sockets,
    messages
}