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

    <div class="search-bar-container">
        <input 
            type="text" 
            v-model="searchTerm" 
            @input="debouncedFetchProducts" 
            placeholder="Buscar productos por nombre o descripción..."
            class="search-input"
        />
    </div>

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
      user: null,
      products: [],
      cart: [],
      loadingProducts: false,
      productsError: null,
      isNavbarHidden: false,
      searchTerm: '', // Nuevo: Para el término de búsqueda
      searchTimeout: null, // Nuevo: Para el debounce
    };
  },
  async mounted() {
    await this.checkAuthStatus();
    if (this.isAuthenticated) {
      await this.getCurrentUser();
      if (this.user) {
        await this.fetchProducts();
        await this.fetchUserCartFromDatabase();
      } else {
        this.isAuthenticated = false;
        this.$router.push('/auth');
      }
    }
  },
  methods: {
    async checkAuthStatus() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          this.isAuthenticated = false;
          return;
        }
        this.isAuthenticated = !!session;
      } catch (error) {
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
        let query = supabase.from('productos').select('*');

        // Aplicar el filtro de búsqueda si searchTerm no está vacío
        if (this.searchTerm) {
            const searchPattern = `%${this.searchTerm}%`; // Para búsqueda "contiene"
            query = query.or(`nombre.ilike.${searchPattern},descripcion.ilike.${searchPattern}`);
        }

        const { data, error } = await query.order('id_producto', { ascending: true });

        if (error) {
          throw error;
        }

        this.products = await Promise.all(
          data.map(async (product) => {
            let signedUrl = '';
            const originalFilePath = product.imagen;

            if (originalFilePath) {
              signedUrl = await this.getSignedUrl(originalFilePath);
            }

            return {
              ...product,
              imagen: signedUrl,
              original_imagen_path: originalFilePath
            };
          })
        );

      } catch (error) {
        this.productsError = "Error al cargar los productos. Por favor, inténtalo de nuevo más tarde.";
      } finally {
        this.loadingProducts = false;
      }
    },

    // Nuevo método para el "debounce"
    debouncedFetchProducts() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.fetchProducts();
        }, 300); // Espera 300ms después de que el usuario deja de escribir
    },

    async getSignedUrl(filePath) {
      if (!filePath) {
          return '';
      }
      try {
          const { data, error } = await supabase.storage
              .from('product-images')
              .createSignedUrl(filePath, 60);

          if (error) {
              return '';
          }
          return data.signedUrl;
      } catch (error) {
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

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
          throw fetchError;
        }

        if (existingCartItem) {
          const { error: updateError } = await supabase
            .from('carritos')
            .update({ cantidad: quantityToUpdate })
            .eq('id_carrito', existingCartItem.id_carrito);

          if (updateError) throw updateError;
          // alert(`${product.nombre} actualizado en tu carrito.`); // Optional: Keep or remove
        } else {
          const { error: insertError } = await supabase
            .from('carritos')
            .insert({
              user_id: this.user.id,
              id_producto: product.id_producto,
              cantidad: 1
            });

          if (insertError) throw insertError;
          // alert(`${product.nombre} añadido a tu carrito.`); // Optional: Keep or remove
        }
      } catch (error) {
        // Rollback local cart changes if DB update fails
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
    loadCartFromLocalStorage() {
      try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            this.cart = parsedCart;
          } else {
            this.cart = [];
            localStorage.removeItem("cart");
          }
        }
      } catch (e) {
        this.cart = [];
      }
    },
    async handleLogout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        localStorage.removeItem('cart');
        localStorage.removeItem('orderHistory'); // Clear order history as well
        this.isAuthenticated = false;
        this.user = null;
        this.products = [];
        this.cart = [];
        this.productsError = null;
        this.$router.push('/');
      } catch (error) {
        alert("Hubo un problema al cerrar sesión: " + error.message);
      }
    }
  },
};
</script>

<style scoped>
/* Tus estilos existentes de ProductosView.vue */
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
  margin: 0 auto;
}

.navbar-buttons {
  display: flex;
  gap: 10px;
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
  background-color: #dc3545;
}

.logoutBtn:hover {
  opacity: 0.8;
  background-color: #c82333;
}

/* Nuevos estilos para el buscador */
.search-bar-container {
    text-align: center;
    margin: 20px auto;
    max-width: 600px;
}

.search-input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 25px; /* Bordes redondeados */
    font-size: 16px;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: #8a2be2; /* Un color morado para el foco */
    box-shadow: 0 0 8px rgba(138, 43, 226, 0.2);
    outline: none;
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
    flex-direction: column;
    gap: 5px;
    width: 100%;
    margin-top: 10px;
  }

  .goToCartBtn, .logoutBtn {
    font-size: 14px;
    padding: 6px 12px;
    margin: 0;
    width: 100%;
  }

  .search-input {
      width: calc(100% - 20px); /* Ajusta para padding */
      margin: 10px; /* Añade margen en pantallas pequeñas */
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