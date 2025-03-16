<template>
  <div v-if="isAuthenticated">
    <header :class="['navbar', { 'navbar-hidden': isNavbarHidden }]">
      <h1 class="navbar-title">CÉSAR'S BAKERY</h1>
      <img src="../imagenes/CESARS BAKERY.png" alt="Logo" class="navbar-logo" />
      <button class="goToCartBtn" @click="goToUltimoPedido">Ultimo pedido</button>
      <button class="goToCartBtn" @click="goToCart">Ir al Carrito</button>
      <button class="goToCartBtn" @click="logout">Cerrar sesión</button>

    </header>
    <table>
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
        <tr v-for="product in products" :key="product.id">
          <td>
            <h1>{{ product.name }}</h1>
          </td>
          <td>
            <h1>{{ product.description }}</h1>
          </td>
          <td>
            <h1>${{ product.price }}</h1>
          </td>
          <td>
            <img
              :src="product.imageUrl"
              alt="Imagen del producto"
              class="product-image"
            />
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
</template>

<script>
export default {
  created() {
    const user = localStorage.getItem("user");
    if (!user) {
      this.$router.push("/"); // 🔹 Si no hay sesión, redirige al login
    }
  },
  name: "ProductosView",
  data() {
    return {
      isAuthenticated: false,
      products: [
        {
          id: 1,
          name: "Brownie",
          description:
            "Un clásico, chocolatoso con un toque de nuez. Ideal para los amantes del chocolate",
          price: 20.0,
          imageUrl:
            "https://th.bing.com/th/id/OIP.VBfpmhSapiPrlGt2PDlu6wHaGL?w=900&h=750&rs=1&pid=ImgDetMain",
        },
        {
          id: 2,
          name: "Galletas con Chispas",
          description:
            "Galletas suaves y crujientes con chispas de chocolate, perfectas para un antojo dulce en cualquier momento.",
          price: 15.0,
          imageUrl:
            "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ8P1Cc8rE8xt5RnaStEUNNWF7de1-eIpMaZwpz5ytPIkamaV6G8I9FiSlP1Y1iK64CQu4mJhha9YMzaCM-Z-Tf19NQnqMe77RZK3Lz9F0GEB8VEnpiL3zu&usqp=CAE",
        },
        {
          id: 3,
          name: "Galletas de Avena",
          description:
            "Una opción deliciosa y más saludable, con avena y un toque de canela. Perfectas para una energía extra.",
          price: 15.0,
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSzBv-YHDEFUIH_02Jwi-0bS5Sf9CvmgER1NA6vUkEhnX01P0rHR6wlWh7HlzMmXpaUO67LCTXk8AbMaW0Asv_5G5SEDhBw4eCdjG3bwGE&usqp=CAE ",
        },
        {
          id: 4,
          name: "Cupcake de chocolate",
          description:
            "Cupcakes esponjosos en sabor de chocolate, decorados con un toque de crema. Dulce y divertido",
          price: 18.0,
          imageUrl:
            "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSK3FyG6ZS307Kn0nyJhoRdWgtdoaLcY-KgoRqeOsWdDoORj7G8nPj4AH1vQEQQJN_BzFgl6h5wU2QVjzPaN8fewkJvX65Ny2ce41Fw_4VITSnCs2lXTEOlBqU&usqp=CAE ",
        },
        {
          id: 5,
          name: "Pay de Queso",
          description:
            "Suave y cremoso cheesecake con una base de galleta. Disponible en sabores tradicionales como fresa y mango.",
          price: 25.0,
          imageUrl:
            "https://cdn.shopify.com/s/files/1/0360/9813/products/Pay_de_Queso_2019_Rebanada_copy_grande.jpg?v=1573082909",
        },
        {
          id: 6,
          name: "Rol de canela",
          description:
            "Suave y esponjoso rol de canela cubierto con un glaseado dulce. Un favorito reconfortante para cualquier momento.",
          price: 45.0,
          imageUrl:
            "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRgpEE_ROxEGTKRdiTyhXxRrt-nVjtFy91H9WhjM3VlbHyHuCMCNasWxm_zalFzBvtnmiBqS4LMEuISQZW5Cs6lyKJ6lxN0-dXdcAoSi5HfPT17EPNynWW1UQ&usqp=CAE ",
        },
      ],
      cart: [],
    };
  },
  methods: {
    addToCart(product) {
      const existingProduct = this.cart.find((item) => item.id === product.id);
      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        this.cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(this.cart));
    },
    goToCart() {
      this.$router.push("/carrito");
    },
    goToUltimoPedido() {
      this.$router.push("/UltimoPedido")
    },
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        this.cart = JSON.parse(storedCart);
      }
    },
    async logout() {
      try {
        // Call the server logout endpoint
        const response = await fetch('http://localhost:4006/api/auth/logout', {
          credentials: 'include'
        });
        
        // Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        this.isAuthenticated = false;
        
        if (response.ok) {
          const data = await response.json();
          
          // If we received a SAML logout URL, redirect to it
          if (data.logoutUrl) {
            window.location.href = data.logoutUrl;
            return;
          }
        }
        
        // If no SAML redirect or if there was an error, just go to login
        this.$router.push("/");
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
        this.isAuthenticated = false;
        this.$router.push("/");
      }
    },
    async checkServerAuthentication() {
    try {
      const response = await fetch('http://localhost:4006/api/auth/check', { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("user", JSON.stringify(data.user));
        this.isAuthenticated = true;
        this.loadCartFromLocalStorage();
      } else {
        this.$router.push("/");
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      this.$router.push("/");
    }
  },
  },
  mounted() {
    const user = localStorage.getItem("user");
      if (!user) {
        this.checkServerAuthentication();
      } else {
        this.isAuthenticated = true;
        this.loadCartFromLocalStorage();
      }
  },
};
</script>

<style scoped>
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
  margin: 0 auto;
}

.goToCartBtn {
  background-color: #b069db;
  color: white;
  padding: 8px 16px;
  font-size: 16px;
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
}

/* Estilos de tabla y otros */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
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
  cursor: pointer;
  font-size: 14px;
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

/* Media query para pantallas pequeñas (500px o menos) */
@media (max-width: 500px) {
  .navbar {
    flex-direction: row;
    justify-content: space-between;
    padding: 10px;
  }

  .navbar-logo {
    width: 50px;
    height: auto;
  }

  .navbar-title {
    font-size: 18px;
    text-align: center;
  }

  .goToCartBtn {
    font-size: 14px;
    padding: 6px 12px;
  }

  /* Ajuste de tabla en modo columna para mejor visualización */
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
  }

  th h2, td h1 {
    font-size: 14px;
  }

  .product-image {
    width: 100%;
    height: auto;
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
