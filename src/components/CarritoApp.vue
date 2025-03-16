<template>
  <div class="CarritoApp">
    <header :class="['navbar', { 'navbar-hidden': isNavbarHidden }]">
      <h1 class="navbar-title">CÉSAR'S BAKERY</h1>
      <img src="../imagenes/CESARS BAKERY.png" alt="Logo" class="navbar-logo" />
    </header>
    <h2>Carrito de Compras</h2>

    <!-- Mensaje de error si existe -->
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

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
        <tr v-for="(item, index) in cartItems" :key="index" class="product-row">
          <th class="product-image-container">
            <img :src="item.imageUrl" alt="Foto de producto" class="product-image" />
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

    <div class="total-section">
      <h3>Total de Productos: {{ totalQuantity }}</h3>
      <h3>Precio Total: {{ formatPrice(totalPrice) }}</h3>
    </div>
    <div class="payment-info">
      <h3>Información de Pago</h3>
      <label class="payment-option">
        <input type="radio" value="efectivo" v-model="selectedPayment" name="paymentMethod" />
        <span class="radio-custom"></span>
        <span>Efectivo</span>
      </label>

      <label class="payment-option">
        <input type="radio" value="transferencia" v-model="selectedPayment" name="paymentMethod" />
        <span class="radio-custom"></span>
        <span>Transferencia</span>
      </label>

      <div v-if="selectedPayment === 'transferencia'" class="bank-details">
        <p><strong>Banco:</strong> BBVA</p>
        <p><strong>Número de Tarjeta:</strong> 1234 5678 9012 3456</p>
        <p><strong>Nombre:</strong> César Ramírez</p>
      </div>

      <div class="button-container">
        <button @click="goBack" class="back-button">Regresar</button>
        <button @click="goToShipping" class="checkout-button">Ir a envío</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cartItems: [], // Inicialmente vacío, se llenará con los datos de localStorage
      selectedPayment: null, // Inicialmente ninguna opción seleccionada
      errorMessage: "", // Mensaje de error
    };
  },
  computed: {
    totalQuantity() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    },
  },
  methods: {
    goToShipping() {
      if (this.cartItems.length === 0) {
        this.errorMessage = "Tu carrito está vacío. Agrega productos antes de proceder al envío.";
        return;
      }
      if (!this.selectedPayment) {
        this.errorMessage = "Por favor selecciona un método de pago antes de continuar.";
        return;
      }
      this.errorMessage = ""; // Limpiar mensaje de error si todo es correcto
      this.$router.push("/EnvioApp");
    },
    formatPrice(price) {
      return `$${price.toFixed(2)}`;
    },
    increaseQuantity(item) {
      item.quantity += 1;
      this.updateLocalStorage();
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity -= 1;
        this.updateLocalStorage();
      }
    },
    removeItem(index) {
      this.cartItems.splice(index, 1);
      this.updateLocalStorage();
    },
    updateLocalStorage() {
      localStorage.setItem("cart", JSON.stringify(this.cartItems));
    },
    goBack() {
      this.$router.back();
    },
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        this.cartItems = JSON.parse(storedCart);
      }
    },
  },
  mounted() {
    this.loadCartFromLocalStorage();
  },
  created() {
    const user = localStorage.getItem("user");
    if (!user) {
      this.$router.push("/"); // Redirige al login si no hay sesión
    }
  }
};
</script>

<style scoped>
.error {
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
}

tbody tr {
  background-color: #f9f9f9; /* Fondo claro para las filas de productos */
}

tbody tr:nth-child(even) {
  background-color: #e0e0e0; /* Fondo un poco más oscuro para filas alternas */
}

.product-image-container {
  background-color: transparent; /* Fondo claro en el contenedor de imagen */
  color: #333; /* Color de texto más oscuro para legibilidad */
}

/* Estilos de la navbar */
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
}

.navbar-title {
  font-size: 24px;
  font-weight: bold;
  margin-right: auto;
}

.navbar-logo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
}

.shopping-cart {
  max-width: 800px;
  margin: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
}

th {
  background-color: #333;
  color: white;
  padding: 12px;
  font-weight: bold;
  font-size: 1em;
}

td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  font-size: 0.95em;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 10px;
}

.product-quantity button {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #e0e0e0;
  border: none;
  color: #333;
  font-weight: bold;
}

.product-quantity span {
  font-weight: bold;
}

.product-remove button {
  background-color: #ff4c4c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 0.9em;
}

.product-remove button:hover {
  background-color: #ff2c2c;
}

.total-section {
  text-align: right;
  margin-top: 20px;
}

.checkout-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
}

.product-table {
  flex: 2;
}

.payment-info {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 5px;
}

.payment-option input[type="radio"] {
  display: none; /* Oculta el círculo predeterminado del input */
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #007bff;
  border-radius: 50%;
  margin-right: 10px;
  display: inline-block;
  position: relative;
}

.payment-option input[type="radio"]:checked + .radio-custom::after {
  content: "";
  width: 10px;
  height: 10px;
  background-color: #007bff;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
}

.bank-details {
  margin-top: 10px;
  font-size: 0.9em;
  color: #333;
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

.back-button {
  padding: 8px 16px;
  background-color: red;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 20px;
}

.back-button:hover {
  background-color: #cd1c18;
}

/* Media query para pantallas de 500px o menos */
@media (max-width: 500px) {
  thead {
    display: none;
  }

  tr {
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background-color: white;
  }

  td {
    border: none;
    padding: 8px 0;
  }

  /* Contenedor de imagen y nombre del producto */
  .product-image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 15px;
    text-align: center;
  }

  .product-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  /* Contenedor de controles en línea */
  .controls-row {
    display: flex;
    flex-direction: column; /* Cambio a columna para apilar verticalmente */
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 10px;
    padding: 10px 0;
    margin: 10px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
  }

  /* Estilos para el precio */
  .product-price {
    display: block;
    text-align: center;
    font-weight: bold;
    width: 100%; /* Asegura que tome todo el ancho */
    margin: 5px 0; /* Añade un poco de espacio arriba y abajo */
  }

  /* Controles de cantidad */
  .product-quantity {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .product-quantity button {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .product-total {
    font-weight: bold;
    min-width: 70px;
    text-align: center;
  }

  /* Botón de eliminar */
  .product-remove {
    width: 100%;
    text-align: center;
  }

  .product-remove button {
    width: 100%;
    padding: 10px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    margin-top: 10px;
  }
  .payment-info {
    display: flex;
    flex-direction: column;
  }

  /* Contenedor específico para los botones */
  .button-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
    width: 100%;
  }

  .back-button,
  .checkout-button {
    flex: 1;
    padding: 12px;
    margin: 0;
    text-align: center;
    border-radius: 5px;
    font-size: 14px;
  }

  .back-button {
    margin-bottom: 0;
  }

  .checkout-button {
    margin-top: 0;
  }
  .navbar-logo {
    width: 50px;
    height: auto;
  }
}
</style>
