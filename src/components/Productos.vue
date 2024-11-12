<template>
  <div v-if="isAuthenticated">
    <table>
      <thead>
        <tr>
          <th>><h2>NOMBRE</h2></th>
          <th><h2>DESCRIPCIÓN</h2></th>
          <th><h2>PRECIO</h2></th>
          <th><h2>IMAGEN</h2></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td><h1>{{ product.name }}</h1></td>
          <td><h1>{{ product.description }}</h1></td>
          <td><h1>{{ product.price }}</h1></td>
          <td><img :src="product.imageUrl" alt="Imagen del producto" class="product-image" /></td>
          <td><button class="addBtn" @click="addToCart(product)"><h1>Agregar</h1></button></td>
        </tr>
      </tbody>
    </table>
    <button class="goToCartBtn" @click="goToCart"><h2>Ir al Carrito</h2></button>
  </div>
</template>

<script>
export default {
  name: 'ProductosView',
  data() {
    return {
      isAuthenticated: true,
      products: [
        { id: 1, name: ' Brownie', description: 'Un clásico, chocolatoso con un toque de nuez. Ideal para los amantes del chocolate', price: 20.00, imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRVP7B40YxYuFvkdmcKu8HdmYuZoYEt1qxupxc6MQQTIKU23zi9Yz_1kozKV9HNa2o1AwIopRYIE9PulVb1q2gqzcT7kTFJi_OQOPnhJZTL4ZBAi6KO6Vuo&usqp=CAE' },
        { id: 2, name: 'Galletas con Chispas', description: 'Galletas suaves y crujientes con chispas de chocolate, perfectas para un antojo dulce en cualquier momento.', price: 15.00, imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ8P1Cc8rE8xt5RnaStEUNNWF7de1-eIpMaZwpz5ytPIkamaV6G8I9FiSlP1Y1iK64CQu4mJhha9YMzaCM-Z-Tf19NQnqMe77RZK3Lz9F0GEB8VEnpiL3zu&usqp=CAE' },
        { id: 3, name: 'Galletas de Avena', description: 'Una opción deliciosa y más saludable, con avena y un toque de canela. Perfectas para una energía extra.', price: 15.00, imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSzBv-YHDEFUIH_02Jwi-0bS5Sf9CvmgER1NA6vUkEhnX01P0rHR6wlWh7HlzMmXpaUO67LCTXk8AbMaW0Asv_5G5SEDhBw4eCdjG3bwGE&usqp=CAE ' },
        { id: 4, name: 'Cupcake de chocolate', description: 'Cupcakes esponjosos en sabor de chocolate, decorados con un toque de crema. Dulce y divertido', price: 18.00, imageUrl: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSK3FyG6ZS307Kn0nyJhoRdWgtdoaLcY-KgoRqeOsWdDoORj7G8nPj4AH1vQEQQJN_BzFgl6h5wU2QVjzPaN8fewkJvX65Ny2ce41Fw_4VITSnCs2lXTEOlBqU&usqp=CAE ' },
        { id: 5, name: 'Pay de Queso', description: 'Suave y cremoso cheesecake con una base de galleta. Disponible en sabores tradicionales como fresa y mango.', price: 25.00, imageUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT2v2C9GgnByTP7XQwqd-5F8Jqt9Mv4dBXQCFLeEqDN1CpC3kpS9YxDxTi4da_S_na3QaMOXdHeU06rfc2pmaFhRYcj_1pxvYpCEIh4OXEep5jTwl1TXzRjXQ&usqp=CAE ' },
        { id: 5, name: 'Rol de canela', description: 'Suave y esponjoso rol de canela cubierto con un glaseado dulce. Un favorito reconfortante para cualquier momento.', price: 45.00, imageUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRgpEE_ROxEGTKRdiTyhXxRrt-nVjtFy91H9WhjM3VlbHyHuCMCNasWxm_zalFzBvtnmiBqS4LMEuISQZW5Cs6lyKJ6lxN0-dXdcAoSi5HfPT17EPNynWW1UQ&usqp=CAE ' }
      ],
      cart: []
    };
  },
  methods: {
    addToCart(product) {
      this.cart.push(product);
    },    
    goToCart() {
      this.$router.push('/carrito');
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
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
  background-color: #04AA6D;
  color: white;
}

.addBtn:hover {
  opacity: 0.8;
}

.goToCartBtn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  margin-top: 10px;
  float: right;
  width: 250px;
  height: 100px;
}

.goToCartBtn:hover {
  opacity: 0.8;
}

/* Estilos de imagen */
.product-image {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 5px;
}

h1 {
  font-size: 15px;
}
h2 {
  font-size: 15px;
}
</style>