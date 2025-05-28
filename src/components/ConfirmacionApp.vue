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
      isAuthenticated: false,
      user: null, // Add user data property
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
    async goBackToMenu() { // Make this method async
      this.saveOrderToHistory();
      await this.clearCartFromSupabase(); // Call the new Supabase clearing method
      this.$router.push("/Productos");
    },
    loadCartFromLocalStorage() {
      // This method can still be used for initial display if you load from local storage first
      // But the source of truth for updates will be Supabase
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
    // New method to clear the cart from Supabase
    async clearCartFromSupabase() {
      if (!this.user) {
        console.error("No user authenticated. Cannot clear cart from Supabase.");
        return;
      }
      try {
        const { error } = await supabase
          .from('carritos') // Make sure 'carritos' is your cart table name
          .delete()
          .eq('user_id', this.user.id); // Delete all entries for the current user

        if (error) {
          console.error("Error clearing cart from Supabase:", error.message);
        } else {
          console.log("Cart cleared from Supabase successfully!");
          this.cartItems = []; // Also clear the local component state
          localStorage.removeItem("cart"); // Optional: clear local storage if you still use it as a cache
        }
      } catch (error) {
        console.error("An unexpected error occurred while clearing cart:", error.message);
      }
    },
    async checkAuthStatus() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          this.isAuthenticated = false;
          return;
        }
        this.isAuthenticated = !!session;
        this.user = session ? session.user : null; // Set the user object

        if (!this.isAuthenticated) {
          this.$router.push('/');
        }
      } catch (error) {
        this.isAuthenticated = false;
        this.$router.push('/');
      }
    },
    // You might also want a method to load cart items from Supabase instead of local storage
    async loadCartFromSupabase() {
      if (!this.user) {
        console.log("No user, cannot load cart from Supabase.");
        return;
      }
      try {
        const { data, error } = await supabase
          .from('carritos')
          .select('id_producto, cantidad')
          .eq('user_id', this.user.id);

        if (error) throw error;

        // Assuming you also need product details like name, price, etc.
        // You'll need to fetch these details based on id_producto
        const productIds = data.map(item => item.id_producto);
        if (productIds.length > 0) {
          const { data: productDetails, error: productError } = await supabase
            .from('productos')
            .select('id_producto, nombre, precio, imagen')
            .in('id_producto', productIds);

          if (productError) throw productError;

          this.cartItems = data.map(cartItem => {
            const detail = productDetails.find(p => p.id_producto === cartItem.id_producto);
            return detail ? {
              id_producto: detail.id_producto,
              name: detail.nombre,
              price: detail.precio,
              quantity: cartItem.cantidad,
              imagen: detail.imagen // This would be the path, you'd need a signed URL as in CarritoApp
            } : null;
          }).filter(Boolean); // Remove nulls
        } else {
          this.cartItems = [];
        }

        // Update local storage as a cache if desired, but Supabase is the source of truth
        localStorage.setItem("cart", JSON.stringify(this.cartItems));

      } catch (error) {
        console.error("Error loading cart from Supabase:", error.message);
        this.cartItems = []; // Clear local cart if there's an error
        localStorage.removeItem("cart"); // Clear local cache
      }
    }
  },
  async mounted() {
    await this.checkAuthStatus(); // Check authentication status and get user
    if (this.isAuthenticated) {
      await this.loadCartFromSupabase(); // Load cart directly from Supabase
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
  background-color: #6c757d;
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