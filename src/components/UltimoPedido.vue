<template>
    <div class="last-order">
      <h2>Último Pedido Realizado</h2>
      <div v-if="lastOrder">
        <p><strong>Fecha:</strong> {{ formatDate(lastOrder.date) }}</p>
        <p><strong>Envío a:</strong> {{ lastOrder.shippingLocation }}</p>
        <h3>Resumen de Pedido</h3>
        <ul>
          <li v-for="item in lastOrder.items" :key="item.name">
            {{ item.name }} x {{ item.quantity }} - {{ formatPrice(item.price * item.quantity) }}
          </li>
        </ul>
        <p><strong>Total:</strong> {{ formatPrice(lastOrder.total) }}</p>
      </div>
      <div v-else>
        <p>No hay pedidos anteriores.</p>
      </div>
      <button @click="goBack" class="back-button">Regresar</button>

    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        lastOrder: null,
      };
    },
    methods: {
      formatPrice(price) {
        return `$${price.toFixed(2)}`;
      },
      formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(date).toLocaleDateString('es-ES', options);
      },
      loadLastOrder() {
        const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
        if (orderHistory.length > 0) {
          this.lastOrder = orderHistory[orderHistory.length - 1];
        }
      },
      goBack() {
        this.$router.push("/Productos")
      },
    },
    mounted() {
      this.loadLastOrder();
    },
    
  };
  </script>
  
  <style scoped>
  .last-order {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .last-order h2 {
    text-align: center;
    color: #333;
  }
  
  .last-order ul {
    list-style: none;
    padding: 0;
  }
  
  .last-order ul li {
    margin: 5px 0;
  }
  .back-button {
  padding: 8px 16px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 20px;
  margin-center: auto;
}
.back-button:hover {
  background-color: #cd1c18;
}
  </style>
  