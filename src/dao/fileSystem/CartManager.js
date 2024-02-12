
const fsPromises = require('fs').promises

class CartManager {
    static id = 0;
    constructor() {
        this.id = CartManager.id++;
    }

    async #readFileCarts() {
        try {
            const content = await fsPromises.readFile('src/DB/carts.json', 'utf-8')
            const contentParse = JSON.parse(content)
            return contentParse
        } catch (error) {
            console.error('Error al leer el archivo ❌')
            throw new Error(error)
        }
    }
    async getCarts() {
        const fileContent = await this.#readFileCarts()
        try {
            if (fileContent.length === 0) console.Error('Error: No se encontraron carritos en el archivo 🛒')
            return fileContent
        } catch (error) {
            console.error('Error: No se encontraron carritos en el archivo 🛒')
            throw new Error(error)
        }
    }
    async writeFileCarts(data) {
        try {
            await fsPromises.writeFile('src/DB/carts.json', JSON.stringify(data))
            console.log('Carrito actualizado con exito ✅!')
        } catch (error) {
            console.error('Error al actualizar el carrito ❌')
            throw new Error(error)
        }
    }
    async addCart(cart) {
        const fileContent = await this.#readFileCarts();
        let newCart = {
            id: CartManager.id++,
            ...cart
        }
        let idUsed = await fileContent.some(c => c.id === newCart.id);
        // A pesar del reinicio del servidor el id siempre sera autoincrementable ↓
        try {
            if (idUsed) {
                let arrayCid = fileContent.map(cart => [cart.id]).flat();
                let cidMayor = Math.max(...arrayCid);
                newCart.id = cidMayor + 1;
                fileContent.push(newCart)
            } else {
                fileContent.push(newCart)
            }
            console.log('carrito agregado con exito ✅');
            await this.writeFileCarts(fileContent);
        } catch (error) {
            console.error('Error: no se ha podido añadir el producto ❌');
            throw new Error(error)
        }
    }
    async addToCart(cart, product) {
        const fileContent = await this.#readFileCarts()
        // agregar el producto al carrito
        try {
            let cartFoundIndex = fileContent.findIndex((c) => c.id === cart.id)
            let productFoundIndex = fileContent[cartFoundIndex].products.findIndex((p) => p.id === product.id)
            let productNotExist = true
            if (fileContent[cartFoundIndex].products[productFoundIndex]) {
                fileContent[cartFoundIndex].products[productFoundIndex].quantity = fileContent[cartFoundIndex].products[productFoundIndex].quantity + 1
                this.writeFileCarts(fileContent) // ver si puedo poner un solo writeFile al final de los if
                console.log('se aumenta el valor quantity 🔼')
            } else if (productNotExist) {
                fileContent[cartFoundIndex].products.push(product)
                this.writeFileCarts(fileContent)
                console.log('producto agregado al carrito ✅')
                console.log('se agreaga un producto al array 🚠')
            }

        } catch (error) {
            console.error(`Error ❌: producto no agregado al carrito con el id: ${cart.id}`)
            throw new Error(error)
        }
    }
    async getCartById(id) {
        const fileContent = await this.#readFileCarts()
        // retornar el producto que cuente con este id
        let cartFound = fileContent.find(cart => cart.id === id)
        try {
            if (cartFound) {
                console.log(`carrrito con el Id: ${id} encontrado ✅`)
                return cartFound
            } else {
                console.error(`Error: carrito con el Id: ${id} no ha sido encontrado ❌`)
            }
        } catch (error) {
            console.error(`Error: carrito con el Id: ${id} no ha sido encontrado ❌`)
            throw new Error(error)
        }
    }
}

const gestionCart = new CartManager()

module.exports = {
    gestionCart
}