<template>
  <div v-if="isAuthenticated">
    <header :class="['navbar', { 'navbar-hidden': isNavbarHidden }]">
      <h1 class="navbar-title">CÉSAR'S BAKERY</h1>
      <img src="../imagenes/CESARS BAKERY.png" alt="Logo" class="navbar-logo" />
      <div class="navbar-buttons">
        <button class="goToCartBtn" @click="goToUltimoPedido">Ultimo pedido</button>
        <button class="goToCartBtn" @click="goToCart">Ir al Carrito</button>
        <button class="logoutBtn" @click="handleLogout">Cerrar Sesión</button>
      </div>
    </header>

    <p v-if="loadingProducts" class="info-message">Cargando productos...</p>
    <p v-if="productsError" class="error-message">{{ productsError }}</p>
    <p v-if="!loadingProducts && !productsError && products.length === 0" class="info-message">No hay productos disponibles en este momento.</p>

    <table v-if="!loadingProducts && !productsError && products.length > 0">
      <thead>
        <tr>
          <th><h2>NOMBRE</h2></th>
          <th><h2>DESCRIPCIÓN</h2></th>
          <th><h2>PRECIO</h2></th>
          <th><h2>IMAGEN</h2></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id_producto">
          <td>
            <h1>{{ product.nombre }}</h1>
          </td>
          <td>
            <h1>{{ product.descripcion }}</h1>
          </td>
          <td>
            <h1>${{ product.precio }}</h1>
          </td>
          <td>
            <img
              v-if="product.imagen"
              :src="product.imagen"
              alt="Imagen del producto"
              class="product-image"
            />
            <span v-else>Sin imagen</span>
          </td>
          <td>
            <button class="addBtn" @click="addToCart(product)">
              <h1>Agregar</h1>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div v-else class="access-denied">
    <p>Necesitas iniciar sesión para ver los productos.</p>
    <button @click="$router.push('/')" class="secondary-button">Iniciar Sesión</button>
  </div>
</template>

<script>
import { supabase } from '@/supabase';

export default {
  name: "ProductosView",
  data() {
    return {
      isAuthenticated: false,
      user: null, // New: To store the current authenticated user
      products: [],
      cart: [], // Client-side cart (local cache)
      loadingProducts: false,
      productsError: null,
      isNavbarHidden: false,
    };
  },
  async mounted() {
    await this.checkAuthStatus();
    if (this.isAuthenticated) {
      await this.getCurrentUser(); // Fetch current user
      if (this.user) {
        await this.fetchProducts(); // Fetch products (needs to be done before fetching cart to map product details)
        await this.fetchUserCartFromDatabase(); // Fetch user's cart from DB
      } else {
        // If user is not obtained despite being authenticated, handle gracefully
        this.isAuthenticated = false;
        console.warn("User session found, but user object could not be retrieved. Redirecting to login.");
        this.$router.push('/auth'); // Redirect to login if user object is missing
      }
    }
  },
  methods: {
    async checkAuthStatus() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          this.isAuthenticated = false;
          return;
        }
        this.isAuthenticated = !!session;
      } catch (error) {
        console.error("Error al verificar el estado de autenticación:", error);
        this.isAuthenticated = false;
      }
    },
    async getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      this.user = user;
    },
    async fetchProducts() {
      this.loadingProducts = true;
      this.productsError = null;
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('id_producto', { ascending: true });

        if (error) {
          throw error;
        }

        this.products = await Promise.all(
          data.map(async (product) => {
            let signedUrl = '';
            const originalFilePath = product.imagen; // This is the raw path from DB

            if (originalFilePath) {
              signedUrl = await this.getSignedUrl(originalFilePath);
            }

            return {
              ...product,
              imagen: signedUrl, // For displaying in ProductosView
              original_imagen_path: originalFilePath // For saving to cart DB/localStorage
            };
          })
        );

      } catch (error) {
        this.productsError = "Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.";
        console.error('Error fetching products:', error.message, error);
      } finally {
        this.loadingProducts = false;
      }
    },

    async getSignedUrl(filePath) {
      if (!filePath) {
          console.warn("getSignedUrl (ProductosView): filePath is empty. Returning empty string.");
          return '';
      }
      try {
          const { data, error } = await supabase.storage
              .from('product-images') // <<-- VERIFY THIS BUCKET NAME IS CORRECT
              .createSignedUrl(filePath, 60); // 60 seconds expiry (adjust as needed)

          if (error) {
              console.error('getSignedUrl (ProductosView): Error obtaining signed URL for', filePath, ':', error.message);
              return '';
          }
          return data.signedUrl;
      } catch (error) {
          console.error('getSignedUrl (ProductosView): GENERAL error obtaining signed URL for', filePath, ':', error);
          return '';
      }
    },

    async fetchUserCartFromDatabase() {
      if (!this.user) return;

      try {
        const { data, error } = await supabase
          .from('carritos')
          .select('id_producto, cantidad')
          .eq('user_id', this.user.id);

        if (error) throw error;

        this.cart = data.map(item => {
          const productDetail = this.products.find(p => p.id_producto === item.id_producto);
          return {
            id_producto: item.id_producto,
            quantity: item.cantidad,
            name: productDetail?.nombre || 'Producto desconocido',
            price: productDetail?.precio || 0,
            imagen: productDetail?.original_imagen_path || ''
          };
        }).filter(item => item !== null);

        localStorage.setItem("cart", JSON.stringify(this.cart));
      } catch (error) {
        console.error("Error al cargar el carrito del usuario desde la DB:", error.message);
        this.cart = [];
        localStorage.removeItem("cart");
      }
    },

    async addToCart(product) {
      if (!this.user) {
        alert('Debes iniciar sesión para añadir productos al carrito.');
        this.$router.push('/auth');
        return;
      }

      let quantityToUpdate = 1;
      const existingProductInLocalCart = this.cart.find((item) => item.id_producto === product.id_producto);
      if (existingProductInLocalCart) {
        existingProductInLocalCart.quantity += 1;
        quantityToUpdate = existingProductInLocalCart.quantity;
      } else {
        this.cart.push({
          id_producto: product.id_producto,
          name: product.nombre,
          description: product.descripcion,
          price: product.precio,
          imagen: product.original_imagen_path,
          quantity: 1
        });
      }
      localStorage.setItem("cart", JSON.stringify(this.cart));

      try {
        const { data: existingCartItem, error: fetchError } = await supabase
          .from('carritos')
          .select('id_carrito, cantidad')
          .eq('user_id', this.user.id)
          .eq('id_producto', product.id_producto)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (existingCartItem) {
          const { error: updateError } = await supabase
            .from('carritos')
            .update({ cantidad: quantityToUpdate })
            .eq('id_carrito', existingCartItem.id_carrito);

          if (updateError) throw updateError;
          alert(`${product.nombre} actualizado en tu carrito.`);
        } else {
          const { error: insertError } = await supabase
            .from('carritos')
            .insert({
              user_id: this.user.id,
              id_producto: product.id_producto,
              cantidad: 1
            });

          if (insertError) throw insertError;
          alert(`${product.nombre} añadido a tu carrito.`);
        }
      } catch (error) {
        console.error("Error al actualizar/insertar el carrito en la DB:", error.message);
        if (existingProductInLocalCart) {
            existingProductInLocalCart.quantity -= 1;
            if (existingProductInLocalCart.quantity === 0) {
                this.cart = this.cart.filter(item => item.id_producto !== product.id_producto);
            }
        } else {
            this.cart = this.cart.filter(item => item.id_producto !== product.id_producto);
        }
        localStorage.setItem("cart", JSON.stringify(this.cart));
        alert("Hubo un problema al guardar el producto en tu carrito en la base de datos.");
      }
    },
    goToCart() {
      this.$router.push("/carrito");
    },
    goToUltimoPedido() {
      this.$router.push("/UltimoPedido");
    },
    // This is now primarily used for initial local cache loading
    loadCartFromLocalStorage() {
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            this.cart = parsedCart;
          } else {
            console.warn("Cart data in localStorage was not an array. Initializing empty cart.");
            this.cart = [];
            localStorage.removeItem("cart");
          }
        }
      } catch (e) {
        console.error("Error loading cart from localStorage:", e);
        this.cart = [];
      }
    },
    async handleLogout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        // Clear local storage data relevant to the user/cart
        localStorage.removeItem('cart');
        // Reset component state
        this.isAuthenticated = false;
        this.user = null;
        this.products = [];
        this.cart = [];
        this.productsError = null;
        // Redirect to login or home page
        this.$router.push('/');
      } catch (error) {
        console.error("Error al cerrar sesión:", error.message);
        alert("Hubo un problema al cerrar sesión: " + error.message);
      }
    }
  },
};
</script>

<style scoped>
/* Your existing CSS styles from ProductosView.vue */
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
  margin-right: auto; /* Pushes the logo and buttons to the right */
}

.navbar-logo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin: 0 auto; /* Centers the logo when no margin-right auto is on title */
}

.navbar-buttons {
  display: flex;
  gap: 10px; /* Space between buttons */
  align-items: center;
}

.goToCartBtn, .logoutBtn {
  background-color: #b069db;
  color: white;
  padding: 8px 16px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.logoutBtn {
  background-color: #dc3545; /* A distinct color for logout */
}

.logoutBtn:hover {
  opacity: 0.8;
  background-color: #c82333;
}

/* Estilos de tabla y otros */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-top: 20px;
}

th, td {
  padding: 20px 10px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f1f1f1;
  color: black;
}

button {
  padding: 8px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.addBtn {
  background-color: #04aa6d;
  color: white;
}

.addBtn:hover,
.goToCartBtn:hover {
  opacity: 0.8;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
}

/* Ajustes de encabezados */
h1, h2 {
  font-size: 16px;
  margin: 0;
}

@keyframes clickShrink {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

.addBtn:active {
  animation: clickShrink 0.2s ease-in-out;
}

/* Mensajes de estado */
.info-message {
  text-align: center;
  margin-top: 20px;
  color: #555;
  font-style: italic;
}

.error-message {
  text-align: center;
  margin-top: 20px;
  color: #dc3545;
  font-weight: bold;
  padding: 10px;
  border: 1px solid #dc3545;
  background-color: #f8d7da;
  border-radius: 5px;
}

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
}
.secondary-button {
    background-color: #6c757d;
    color: white;
}

/* Media query para pantallas pequeñas (500px o menos) */
@media (max-width: 500px) {
  .navbar {
    flex-direction: column;
    align-items: center;
    padding: 10px;
  }

  .navbar-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
  }

  .navbar-title {
    font-size: 18px;
    text-align: center;
    margin-bottom: 10px;
  }

  .navbar-buttons {
    flex-direction: column; /* Stack buttons vertically on small screens */
    gap: 5px;
    width: 100%; /* Make buttons take full width */
    margin-top: 10px;
  }

  .goToCartBtn, .logoutBtn {
    font-size: 14px;
    padding: 6px 12px;
    margin: 0; /* Remove horizontal margin */
    width: 100%; /* Make buttons full width */
  }

  table, tbody, tr, th, td {
    display: block;
    width: 100%;
  }

  th, td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  tr {
    margin-bottom: 10px;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
  }

  th h2, td h1 {
    font-size: 14px;
  }

  .product-image {
    width: 100%;
    height: auto;
    max-height: 200px;
    object-fit: contain;
    margin-bottom: 10px;
  }

  .addBtn {
    width: 100%;
    font-size: 16px;
    padding: 8px;
  }
  thead {
    display: none;
  }
}
</style>