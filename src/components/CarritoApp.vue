<template>
  <div class="CarritoApp">
    <h2>Carrito de Compras</h2>
    <table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Cantidad</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in cartItems" :key="index">
          <td>
            <img
              :src="item.image"
              alt="Foto de producto"
              class="product-image"
            />
            <span>{{ item.name }}</span>
          </td>
          <td>{{ formatPrice(item.price) }}</td>
          <td>
            <button @click="decreaseQuantity(item)">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="increaseQuantity(item)">+</button>
          </td>
          <td>{{ formatPrice(item.price * item.quantity) }}</td>
          <td>
            <button @click="removeItem(index)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="total-section">
      <h3>Total de Productos: {{ totalQuantity }}</h3>
      <h3>Precio Total: {{ formatPrice(totalPrice) }}</h3>
    </div>
    <router-link to="/EnvioApp" class="checkout-button">Ir a Pagar</router-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cartItems: [
        {
          name: "Pastel de Chocolate",
          price: 50,
          quantity: 1,
          image: "ruta_a_la_imagen",
        },
        { name: "Flan", price: 30, quantity: 2, image: "ruta_a_la_imagen" },
        {
          name: "Galleta de chocolate",
          price: 15,
          quantity: 3,
          image: "ruta_a_la_imagen",
        },
      ],
    };
  },
  computed: {
    totalQuantity() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    totalPrice() {
      return this.cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },
  },
  methods: {
    formatPrice(price) {
      return `$${price.toFixed(2)}`;
    },
    increaseQuantity(item) {
      item.quantity += 1;
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
      }
    },
    removeItem(index) {
      this.cartItems.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.shopping-cart {
  max-width: 800px;
  margin: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th,
td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
}
.product-image {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}
.total-section {
  text-align: right;
  margin-top: 20px;
}
button {
  margin: 0 5px;
  padding: 5px 10px;
}
.checkout-button {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  text-align: center;
  border-radius: 5px;
}
.checkout-button:hover {
  background-color: #0056b3;
}
</style>
