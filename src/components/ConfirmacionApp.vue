<template>
  <div class="order-confirmation">
    <!-- Mensaje de agradecimiento -->
    <div class="thank-you-alert">
      <span class="check-icon">✔️</span>
      <p>¡Gracias por tu compra!</p>
    </div>

    <!-- Resumen de la compra -->
    <div class="order-summary">
      <h3>Resumen de Pedido</h3>
      <ul>
        <li v-for="item in cartItems" :key="item.name" class="order-item">
          <span>{{ item.name }} x {{ item.quantity }}</span>
          <span>{{ formatPrice(item.price * item.quantity) }}</span>
        </li>
      </ul>
      <p class="total">Total: {{ formatPrice(totalPrice) }}</p>
    </div>

    <!-- Lugar de envío -->
    <div class="shipping-info">
      <h4>Envío a:</h4>
      <p>{{ selectedShippingLocation }}</p>
    </div>

    <!-- Botón de volver al menú -->
    <button @click="goBackToMenu" class="back-button">Volver al Menú</button>

    <!-- Espacio para el logo -->
    <div class="logo-space">
      <img src="ruta_al_logo" alt="Logo" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cartItems: [
        // Estos datos deberían venir del estado del carrito
        { name: "Brownie", price: 50, quantity: 1 },
        { name: "Galletas con Chispas", price: 30, quantity: 2 },
      ],
      selectedShippingLocation: "Facultad de Ciencias - ",
    };
  },
  computed: {
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
    goBackToMenu() {
      this.$router.push("/Productos"); // Redirige a la página principal del menú
    },
  },
};
</script>

<style scoped>
.order-confirmation {
  max-width: 600px;
  margin: auto;
  text-align: center;
  padding: 20px;
}

.thank-you-alert {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.check-icon {
  font-size: 2em;
  margin-right: 10px;
}

.order-summary {
  text-align: left;
  margin-bottom: 20px;
}

.order-summary h3 {
  margin-bottom: 10px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.total {
  font-weight: bold;
  text-align: right;
}

.shipping-info {
  background-color: #f1f1f1;
  padding: 10px;
  margin: 20px 0;
  border-radius: 5px;
}

.back-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #0056b3;
}

.logo-space {
  margin-top: 20px;
}

.logo-space img {
  width: 100px;
  height: auto;
}
</style>
