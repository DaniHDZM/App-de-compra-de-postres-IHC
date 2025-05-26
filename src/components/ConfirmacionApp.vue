<template>
  <div class="order-confirmation" v-if="isAuthenticated">
    <div class="thank-you-alert">
      <span class="check-icon">✔️</span>
      <p>¡Gracias por tu compra!</p>
    </div>
    <div>
      <small>
        Nos encontramos en camino a tu ubicación seleccionada, vamos con una
        playera rosa para que nos puedas identificar fácilmente, recuerda que si
        seleccionaste transferencia deberás mostrarnos el comprobante de ella :)
      </small>
    </div>

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

    <div class="shipping-info">
      <h4>Envío a:</h4>
      <p>{{ selectedFacultadCampus }}</p>
    </div>

    <button @click="goBackToMenu" class="back-button">Volver al Menú</button>

    <div class="logo-space">
      <img src="../imagenes/CESARS BAKERY.png" alt="Logo" />
    </div>
  </div>
  <div v-else class="access-denied">
    <p>Necesitas iniciar sesión para ver los detalles de tu pedido.</p>
    <button @click="$router.push('/auth')" class="secondary-button">Iniciar Sesión</button>
  </div>
</template>

<script>
import { supabase } from '@/supabase';
export default {
  data() {
    return {
      isAuthenticated: false, // New: To track authentication status
      cartItems: [],
      selectedFacultadCampus:
        localStorage.getItem("selectedFacultadCampus") || "No seleccionado",
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
      this.saveOrderToHistory();
      this.clearCart();
      this.$router.push("/Productos");
    },
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    },
    saveOrderToHistory() {
      const orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
      const newOrder = {
        items: this.cartItems,
        total: this.totalPrice,
        shippingLocation: this.selectedFacultadCampus,
        date: new Date().toISOString(), // Guarda la fecha del pedido
      };
      orderHistory.push(newOrder);
      localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
    },
    clearCart() {
      localStorage.removeItem("cart");
      this.cartItems = [];
    },
    async checkAuthStatus() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          this.isAuthenticated = false;
          return;
        }
        this.isAuthenticated = !!session; // Sets true if session exists, false otherwise
        if (!this.isAuthenticated) {
          this.$router.push('/'); // Redirect to login if not authenticated
        }
      } catch (error) {
        console.error("Error al verificar el estado de autenticación:", error);
        this.isAuthenticated = false;
        this.$router.push('/'); // Redirect on general error
      }
    },
  },
  async mounted() {
    await this.checkAuthStatus(); // Check authentication status first
    if (this.isAuthenticated) {
      this.loadCartFromLocalStorage();
    }
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

/* Styles for access denied message */
.access-denied {
  text-align: center;
  padding: 30px;
  background-color: #ffe0e0;
  border: 1px solid #dc3545;
  border-radius: 5px;
  color: #dc3545;
  margin-top: 30px;
}

.access-denied button {
  margin-top: 20px;
  background-color: #6c757d; /* secondary button style */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.access-denied button:hover {
  background-color: #5a6268;
}
</style>