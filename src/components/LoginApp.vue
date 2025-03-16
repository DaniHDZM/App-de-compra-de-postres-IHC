<template>
  <div class="navbar">
    <img src="../imagenes/CESARS BAKERY.png" alt="Avatar" class="avatar">
    <h1 class="title">Cesar's Bakery</h1>
    <button class="login-btn" @click="handleLogin()">Iniciar Sesión</button>
  </div>
  
  <div class="background">
    <div class="content-container">
      <h2>Bienvenido a Cesar's Bakery</h2>
      <p>Disfruta de los mejores productos horneados con la mejor calidad y sabor. ¡Únete a nuestra comunidad!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginApp',
  data() {
    return {
      email: localStorage.getItem('email') || '',
      rememberMe: localStorage.getItem('rememberMe') === 'true',
      user: null,
    };
  },
  methods: {
    async checkLogin() {
      console.log("Checking login status...");
      try {
        const response = await fetch('http://localhost:4006/api/auth/check', { 
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Auth check response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Auth check data:", data);
          this.user = data.user;
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Only redirect if not already on the products page
          if (this.$route.path !== '/Productos') {
            console.log("Redirecting to products page");
            this.$router.push('/Productos');
          }
        } else {
          console.log("Not authenticated, staying on login page");
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        localStorage.removeItem('user');
      }
    },
    handleLogin() {
      window.location.href = 'http://localhost:4006';
    }
  },
  mounted() {
    this.checkLogin(); // 🔹 Verifica autenticación antes de redirigir
  }
};
</script>


<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgb(150, 2, 150);
  padding: 15px 30px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.title {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  flex-grow: 1;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.login-btn {
  background-color: #04AA6D;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.background {
  background-image: url('https://wallpapers.com/images/hd/bakery-background-with-breads-fma2es3go1xv8qv1.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
}

.content-container {
  background: rgba(230, 188, 153);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  max-width: 600px;
}

h2 {
  color: #333;
}
</style>
