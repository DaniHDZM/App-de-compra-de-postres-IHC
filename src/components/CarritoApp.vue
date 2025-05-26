<template>
  <div class="CarritoApp">
    <header :class="['navbar', { 'navbar-hidden': isNavbarHidden }]">
      <h1 class="navbar-title">CÉSAR'S BAKERY</h1>
      <img src="../imagenes/CESARS BAKERY.png" alt="Logo" class="navbar-logo" />
    </header>
    <h2>Carrito de Compras</h2>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loadingCart" class="info-message">Cargando carrito...</p>

    <table v-if="!loadingCart && cartItems.length > 0">
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
        <tr v-for="(item, index) in cartItems" :key="item.id_producto || index" class="product-row">
          <th class="product-image-container">
            <img :src="item.imagen" alt="Foto de producto" class="product-image" />
            <span>{{ item.name }}</span>
          </th>
          <td class="controls-row">
            <span class="product-price">{{ formatPrice(item.price) }}</span>
          </td>
          <td>
            <span class="product-quantity">
              <button @click="decreaseQuantity(item)">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="increaseQuantity(item)">+</button>
            </span>
          </td>
          <td>
            <span class="product-total">{{ formatPrice(item.price * item.quantity) }}</span>
          </td>
          <td class="product-remove">
            <button @click="removeItem(index)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else-if="!loadingCart" class="info-message">Tu carrito está vacío.</p>

    <div class="total-section" v-if="cartItems.length > 0">
      <h3>Total de Productos: {{ totalQuantity }}</h3>
      <h3>Precio Total: {{ formatPrice(totalPrice) }}</h3>
    </div>

    <div class="delivery-payment-info" v-if="cartItems.length > 0">
      <h3>Información de Entrega y Pago</h3>

      <div class="form-group">
        <label for="lugar-entrega">Lugar de Entrega:</label>
        <select id="lugar-entrega" v-model="selectedDeliveryLocation">
          <option value="">Selecciona un lugar</option>
          <option v-for="lugar in deliveryLocations" :key="lugar" :value="lugar">{{ lugar }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="metodo-pago">Método de Pago:</label>
        <select id="metodo-pago" v-model="selectedPaymentMethod">
          <option value="">Selecciona un método</option>
          <option v-for="metodo in paymentMethods" :key="metodo" :value="metodo">{{ metodo }}</option>
        </select>
      </div>

      <div v-if="selectedPaymentMethod === 'transferencia'" class="bank-details">
        <p><strong>Banco:</strong> BBVA</p>
        <p><strong>Número de Tarjeta:</strong> 1234 5678 9012 3456</p>
        <p><strong>Nombre:</strong> César Ramírez</p>
      </div>
    </div>

    <div class="button-container">
      <button @click="goBack" class="back-button">Regresar</button>
      <button @click="goToShipping" class="checkout-button" :disabled="!isCheckoutEnabled">Ir a envío</button>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/supabase';

const DELIVERY_LOCATIONS = [
  'Facultad de Telematica',
  'Facultad de Medicina',
  'Facultad de Mercadotecnia',
  'Facultad de Lenguas Extranjeras',
  'Facultad de Psicología',
];

const PAYMENT_METHODS = ['efectivo', 'transferencia'];

export default {
  name: 'CarritoApp',
  data() {
    return {
      cartItems: [],
      user: null, // To store the authenticated user object
      selectedDeliveryLocation: '', // Model for delivery location dropdown
      selectedPaymentMethod: '',    // Model for payment method dropdown
      deliveryLocations: DELIVERY_LOCATIONS,
      paymentMethods: PAYMENT_METHODS,
      errorMessage: "",
      isNavbarHidden: false,
      loadingCart: false, // New: loading state for cart
    };
  },
  computed: {
    totalQuantity() {
      return this.cartItems.reduce((total, item) => {
        const quantity = (typeof item.quantity === 'number' && !isNaN(item.quantity)) ? item.quantity : 0;
        return total + quantity;
      }, 0);
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => {
        const price = (typeof item.price === 'number' && !isNaN(item.price)) ? item.price : 0;
        const quantity = (typeof item.quantity === 'number' && !isNaN(item.quantity)) ? item.quantity : 0;
        return total + (price * quantity);
      }, 0);
    },
    isCheckoutEnabled() {
      // Enable checkout only if cart is not empty and both selections are made
      return this.cartItems.length > 0 && !!this.selectedDeliveryLocation && !!this.selectedPaymentMethod;
    }
  },
  methods: {
    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
      if (!user) {
        // Redirect to auth if no user is found
        this.$router.push('/');
      }
    },
    async getSignedUrl(filePath) {
      // ** IMPORTANT: Replace this with your actual default image path if you have one.
      const defaultPlaceholder = '/src/imagenes/default-product.png'; // Example: a local default image
      // Or an external one: 'https://via.placeholder.com/60x60?text=No+Image';

      if (!filePath) {
        console.warn("getSignedUrl (CarritoApp): filePath is empty. Returning default placeholder.");
        return defaultPlaceholder;
      }
      try {
        const { data, error } = await supabase.storage
          .from('product-images') // <<-- VERIFY THIS BUCKET NAME IS CORRECT
          .createSignedUrl(filePath, 60); // 60 seconds expiry (adjust as needed)

        if (error) {
          console.error('getSignedUrl (CarritoApp): Error obtaining signed URL for', filePath, ':', error.message);
          return defaultPlaceholder;
        }
        return data.signedUrl;
      } catch (error) {
        console.error('getSignedUrl (CarritoApp): GENERAL error obtaining signed URL for', filePath, ':', error);
        return defaultPlaceholder;
      }
    },

    async loadCartFromDatabase() {
      this.loadingCart = true;
      this.errorMessage = ""; // Clear previous errors
      if (!this.user) {
        this.errorMessage = "Necesitas iniciar sesión para ver tu carrito.";
        this.cartItems = [];
        this.loadingCart = false;
        return;
      }

      try {
        // Fetch cart items for the current user, including delivery and payment preferences
        const { data: cartData, error: cartError } = await supabase
          .from('carritos')
          .select('id_producto, cantidad, lugar_entrega, metodo_pago')
          .eq('user_id', this.user.id);

        if (cartError) throw cartError;

        // Extract product IDs and set delivery/payment if consistent across items
        const productIds = new Set();
        let consistentLocation = null;
        let consistentPayment = null;

        if (cartData.length > 0) {
          consistentLocation = cartData[0].lugar_entrega;
          consistentPayment = cartData[0].metodo_pago;
        }

        cartData.forEach(item => {
          productIds.add(item.id_producto);
          // Check for consistency across all items in cart (optional, but good practice)
          if (item.lugar_entrega !== consistentLocation) consistentLocation = null;
          if (item.metodo_pago !== consistentPayment) consistentPayment = null;
        });

        // Set selected location and payment from database, if consistent
        this.selectedDeliveryLocation = consistentLocation || '';
        this.selectedPaymentMethod = consistentPayment || '';


        // Fetch details for all products in the cart
        const { data: productsData, error: productsError } = await supabase
          .from('productos')
          .select('id_producto, nombre, descripcion, precio, imagen') // 'imagen' here is the file path from products table
          .in('id_producto', Array.from(productIds)); // Convert Set to Array

        if (productsError) throw productsError;

        // Combine cart data with product details and fetch signed URLs
        this.cartItems = await Promise.all(cartData.map(async cartItem => {
          const productDetail = productsData.find(p => p.id_producto === cartItem.id_producto);

          if (!productDetail) {
            console.warn(`Product with ID ${cartItem.id_producto} not found in 'productos' table.`);
            return null;
          }

          let signedUrl = await this.getSignedUrl(productDetail.imagen);

          return {
            id_producto: productDetail.id_producto,
            name: productDetail.nombre,
            description: productDetail.descripcion,
            price: productDetail.precio,
            quantity: cartItem.cantidad,
            imagen: signedUrl, // Fresh signed URL
            // No need to store delivery/payment on each cart item if it's per-cart
            // lugarEntrega: cartItem.lugar_entrega,
            // metodoPago: cartItem.metodo_pago,
          };
        }).filter(item => item !== null)); // Filter out any items that couldn't be fully mapped

        // Update localStorage as a cache (optional)
        localStorage.setItem("cart", JSON.stringify(this.cartItems));

      } catch (error) {
        this.errorMessage = "Error al cargar el carrito: " + error.message;
        console.error("Error loading cart from DB:", error.message);
        this.cartItems = [];
        localStorage.removeItem("cart"); // Clear invalid local cache
      } finally {
        this.loadingCart = false;
      }
    },

    // Method to update delivery location and payment method in DB
    async updateCartDetailsInDatabase() {
      if (!this.user) {
        this.errorMessage = "Debes iniciar sesión para actualizar los detalles del carrito.";
        return;
      }
      if (this.cartItems.length === 0) {
        this.errorMessage = "Tu carrito está vacío. No hay detalles que actualizar.";
        return;
      }
      if (!this.selectedDeliveryLocation) {
        this.errorMessage = "Por favor, selecciona un lugar de entrega.";
        return;
      }
      if (!this.selectedPaymentMethod) {
        this.errorMessage = "Por favor, selecciona un método de pago.";
        return;
      }

      try {
        // Update the delivery and payment info for all items in the current user's cart.
        // This assumes these details apply to the entire cart, not individual items.
        const { error } = await supabase
          .from('carritos')
          .update({
            lugar_entrega: this.selectedDeliveryLocation,
            metodo_pago: this.selectedPaymentMethod
          })
          .eq('user_id', this.user.id); // Update all items for this user

        if (error) throw error;
        // console.log("Delivery and payment details updated successfully in DB.");
        this.errorMessage = ""; // Clear any previous error messages
        return true; // Indicate success
      } catch (error) {
        console.error("Error updating delivery/payment in DB:", error.message);
        this.errorMessage = "Error al guardar la información de entrega y pago.";
        return false; // Indicate failure
      }
    },

    async goToShipping() {
      if (!this.isCheckoutEnabled) {
        this.errorMessage = "Por favor, asegura que tu carrito no esté vacío y que hayas seleccionado un lugar de entrega y un método de pago.";
        return;
      }

      const success = await this.updateCartDetailsInDatabase();
      if (success) {
        this.$router.push("/ConfirmacionApp"); // Ensure this route is configured
      }
    },

    formatPrice(price) {
      if (typeof price === 'number' && !isNaN(price)) {
        return `$${price.toFixed(2)}`;
      }
      return '$0.00';
    },

    async increaseQuantity(item) {
      if (!this.user) {
        this.errorMessage = 'Debes iniciar sesión para modificar el carrito.'; return;
      }
      if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
        item.quantity = 0;
      }
      item.quantity += 1;
      this.updateLocalStorage(); // Optimistic update for local cache

      try {
        const { error } = await supabase
          .from('carritos')
          .update({ cantidad: item.quantity })
          .eq('user_id', this.user.id)
          .eq('id_producto', item.id_producto);

        if (error) throw error;
        this.errorMessage = "";
      } catch (error) {
        console.error("Error updating quantity in DB:", error.message);
        item.quantity -= 1; // Revert local change if DB update fails
        this.updateLocalStorage();
        this.errorMessage = "Error al actualizar la cantidad en la base de datos.";
      }
    },

    async decreaseQuantity(item) {
      if (!this.user) {
        this.errorMessage = 'Debes iniciar sesión para modificar el carrito.'; return;
      }
      if (typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 1) {
        item.quantity -= 1;
        this.updateLocalStorage(); // Optimistic update for local cache

        try {
          const { error } = await supabase
            .from('carritos')
            .update({ cantidad: item.quantity })
            .eq('user_id', this.user.id)
            .eq('id_producto', item.id_producto);

          if (error) throw error;
          this.errorMessage = "";
        } catch (error) {
          console.error("Error updating quantity in DB:", error.message);
          item.quantity += 1; // Revert local change if DB update fails
          this.updateLocalStorage();
          this.errorMessage = "Error al actualizar la cantidad en la base de datos.";
        }
      } else if (item.quantity === 1) {
        // If quantity is 1 and decreased, remove the item
        await this.removeItem(this.cartItems.indexOf(item));
      }
    },

    async removeItem(index) {
      if (!this.user) {
        this.errorMessage = 'Debes iniciar sesión para eliminar items del carrito.'; return;
      }
      const itemToRemove = this.cartItems[index];
      this.cartItems.splice(index, 1); // Optimistic removal from local cache
      this.updateLocalStorage(); // Update local storage

      try {
        const { error } = await supabase
          .from('carritos')
          .delete()
          .eq('user_id', this.user.id)
          .eq('id_producto', itemToRemove.id_producto);

        if (error) throw error;
        this.errorMessage = "";
      } catch (error) {
        console.error("Error deleting item from DB:", error.message);
        this.errorMessage = "Error al eliminar el producto de la base de datos. Por favor, recarga la página.";
        await this.loadCartFromDatabase();
      }
    },

    updateLocalStorage() {
      try {
        localStorage.setItem("cart", JSON.stringify(this.cartItems));
      } catch (e) {
        console.error("Error al guardar en localStorage:", e);
        this.errorMessage = "No se pudo actualizar el carrito localmente. Intenta de nuevo.";
      }
    },
    goBack() {
      this.$router.back();
    },
  },
  async mounted() {
    await this.getCurrentUser();
    await this.loadCartFromDatabase();
  },
};
</script>

<style scoped>
.error {
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
  text-align: center;
  padding: 8px;
  border: 1px solid red;
  background-color: #ffe0e0;
  border-radius: 4px;
}

.info-message {
  text-align: center;
  margin-top: 20px;
  color: #555;
  font-style: italic;
}

tbody tr {
  background-color: #f9f9f9;
}

tbody tr:nth-child(even) {
  background-color: #eef0f2;
}

.product-image-container {
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: purple;
  color: white;
  padding: 10px 20px;
  position: relative;
  top: 0;
  z-index: 1000;
  margin-bottom: 20px;
}

.navbar-title {
  font-size: 24px;
  font-weight: bold;
  margin-right: auto;
}

.navbar-logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.CarritoApp > h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

th {
  background-color: #4a0e6c;
  color: white;
  padding: 12px 15px;
  font-weight: bold;
  font-size: 1em;
  text-align: left;
}

th:first-child {
  border-top-left-radius: 8px;
}
th:last-child {
  border-top-right-radius: 8px;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #ddd;
  font-size: 0.95em;
  text-align: left;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.product-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-quantity button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: 1px solid #ccc;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.product-quantity button:hover {
  background-color: #d0d0d0;
}

.product-quantity span {
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.product-remove button {
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.2s ease;
}

.product-remove button:hover {
  background-color: #e02b2b;
}

.total-section {
  text-align: right;
  margin-top: 25px;
  padding-right: 15px;
}
.total-section h3 {
  margin: 5px 0;
  color: #333;
}

/* Styles for Delivery and Payment Info Section */
.delivery-payment-info {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  margin-top: 25px;
  background-color: #f9f9f9;
}
.delivery-payment-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}
.delivery-payment-info .form-group {
  margin-bottom: 15px;
}
.delivery-payment-info label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}
.delivery-payment-info select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  font-size: 1em;
  box-sizing: border-box; /* Include padding in element's total width and height */
}
.delivery-payment-info select:focus {
  border-color: #8a2be2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
}

.bank-details {
  margin-top: 15px;
  padding: 10px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  font-size: 0.9em;
  color: #333;
  background-color: #fff;
}
.bank-details p {
  margin: 5px 0;
}

.button-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-top: 25px;
}

.back-button,
.checkout-button {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.back-button:active,
.checkout-button:active {
  transform: scale(0.98);
}

.back-button {
  background-color: #777;
  color: white;
}
.back-button:hover {
  background-color: #555;
}

.checkout-button {
  background-color: #8a2be2;
  color: white;
  text-decoration: none;
}
.checkout-button:hover {
  background-color: #7b24c6;
}
.checkout-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Media query para pantallas de 500px o menos */
@media (max-width: 500px) {
  .navbar {
    flex-direction: column;
    padding: 15px;
  }
  .navbar-logo {
    width: 80px;
    height: 80px;
    margin-top: 10px;
  }
  .navbar-title {
    font-size: 20px;
    margin-bottom: 5px;
  }

  thead {
    display: none;
  }

  tr.product-row {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  }

  td {
    border: none;
    padding: 8px 0;
    text-align: center;
  }
  th.product-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
    text-align: center;
    width: 100%;
  }

  .product-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
  }
  .product-image-container span {
    font-weight: bold;
    color: #333;
  }

  td.controls-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 10px;
    padding: 10px 0;
    margin: 10px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  .product-price {
    font-weight: bold;
    font-size: 1.1em;
    color: #4a0e6c;
  }

  .product-quantity {
    justify-content: center;
  }

  .product-quantity button {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .product-total {
    font-weight: bold;
    font-size: 1.1em;
    margin-top: 8px;
  }

  td.product-remove {
    width: 100%;
    text-align: center;
    padding-top: 10px;
  }

  .product-remove button {
    width: auto;
    padding: 10px 20px;
    font-size: 0.95em;
  }

  .delivery-payment-info {
    padding: 15px;
  }
  .delivery-payment-info select {
    font-size: 0.9em;
  }

  .button-container {
    flex-direction: column;
    gap: 10px;
  }

  .back-button,
  .checkout-button {
    width: 100%;
    margin: 0;
  }
}
</style>