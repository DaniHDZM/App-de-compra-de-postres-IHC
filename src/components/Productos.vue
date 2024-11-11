<template>
    <div v-if="isAuthenticated">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.description }}</td>
            <td>{{ product.price }}</td>
            <td><button @click="addToCart(product)">Agregar</button></td>
          </tr>
        </tbody>
      </table>
      <button @click="goToCart">Ir al Carrito</button>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductosView',
    data() {
      return {
        isAuthenticated: true,
        products: [
          { id: 1, name: 'Producto 1', description: 'Descripción del producto 1', price: 10.99 },
          { id: 2, name: 'Producto 2', description: 'Descripción del producto 2', price: 15.99 }
        ],
        cart: []
      };
    },
    methods: {
      addToCart(product) {
        this.cart.push(product);
      },    
      goToCart() {
        this.$router.push('/carrito');
      }
    }
  };
  </script>
  
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f1f1f1;
    color: black;
  }
  
  button {
    background-color: #04AA6D;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
  }
  
  button:hover {
    opacity: 0.8;
  }
  
  .goToCartBtn {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    margin-top: 10px;
    float: right;
  }
  
  /* Botón "Ir al Carrito" al hacer hover */
  .goToCartBtn:hover {
    opacity: 0.8;
  }
  </style>





