<template>
  <div v-if="isAuthenticated">
    <header :class="['navbar', { 'navbar-hidden': isNavbarHidden }]">
      <h1 class="navbar-title">CÉSAR'S BAKERY</h1>
      <img src="../imagenes/CESARS BAKERY.png" alt="Logo" class="navbar-logo" />
      <button class="goToCartBtn" @click="goToCart">Ir al Carrito</button>
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
            <h1>{{ product.price }}</h1>
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
  name: "ProductosView",
  data() {
    return {
      isAuthenticated: true,
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
          id: 5,
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
    loadCartFromLocalStorage() {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        this.cart = JSON.parse(storedCart);
      }
    },
  },
  mounted() {
    this.loadCartFromLocalStorage();
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
  margin-right: auto; /* Título alineado a la izquierda */
}

.navbar-logo {
  width: 150px; /* Tamaño de la imagen */
  height: 150px;
  border-radius: 50%;
  margin: 0 auto; /* Centra la imagen en la navbar */
}

.goToCartBtn {
  background-color: #b069db;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  font-size: 20px;
}

/* Estilos de tabla y otros */
table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 80px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f1f1f1;
  color: black;
}

button {
  padding: 10px 50px;
  border: none;
  cursor: pointer;
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
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 5px;
}

h1,
h2 {
  font-size: 15px;
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
</style>
