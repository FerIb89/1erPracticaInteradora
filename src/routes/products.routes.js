const express = require('express')
const productsRouter = express.Router()

const { ProductManager } = require('../dao/DBManager.js')
const productManager = new ProductManager()

productsRouter.get('/', async (req, res) => {
    try {
        const product = await productManager.read()
        res.send({ products: product })

    } catch (error) {
        res.status(500).send(error.message)
    }
});

productsRouter.post('/', async (req, res) => {
    const {
        title,
        description,
        code,
        price,
        thumbnail,
        stock,
        category,
        status,
    } = req.body

    if (!title || !description || !code || !price || !thumbnail || !stock || !category) {
        res.status(400).send({ error: 'Faltan datos 📑' })
    }
    try {
        response = await productManager.create({
            title,
            description,
            code,
            price,
            thumbnail,
            stock,
            category,
            status,
        })
        res.status(200).send({ message: 'Producto creado con exito 🎉', response })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

productsRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const response = await productManager.delete(id);

        if (Boolean(response) === true) {
            res.status(200).send({ message: 'Producto eliminado ❌', response });
        } else {
            res.status(500).send({ message: 'Producto no encontrado 🔎', response });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
})

productsRouter.put('/:id', async (req, res) => {
    const { id } = req.params
    const {
        title,
        description,
        code,
        price,
        thumbnail,
        stock,
        category,
        status,
    } = req.body

    if (!title || !description || !code || !price || !thumbnail || !stock || !category) {
        res.status(400).send({ error: 'Faltan datos 📑' })
    }

    try {
        const response = await productManager.update(id, {
            title,
            description,
            code,
            price,
            thumbnail,
            stock,
            category,
            status,
        })
        res.status(200).send({ message: 'Producto actualizado 🔼', response })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = {
    productsRouter,
}