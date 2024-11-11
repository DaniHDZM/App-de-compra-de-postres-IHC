<template>
  <div class="Bar">
    <h1>Inicia sesión</h1>
    <img src="../imagenes/CESARS BAKERY.png" alt="Avatar" class="avatar">
  </div>
  <form @submit.prevent="handleLogin">
    <div class="container">
      <label for="uname"><b>Email</b></label>
      <input type="email" placeholder="Enter Email" name="uname" v-model="email" required>

      <label for="psw"><b>Password</b></label>
      <input type="password" placeholder="Enter Password" name="psw" v-model="password" required>

      <label>
        <input type="checkbox" v-model="rememberMe"> Recuérdame
      </label>

      <div class="clearfix">
        <button type="button" class="cancelbtn" @click="goToRegister">Ir a registrarse</button>
        <button type="submit" class="signupbtn">Iniciar Sesión</button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'LoginApp',
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false, // Estado del checkbox
    };
  },
  mounted() {
    // Recupera el email y contraseña de localStorage si el usuario marcó "Recuérdame"
    if (localStorage.getItem('rememberMe') === 'true') {
      this.email = localStorage.getItem('email') || '';
      this.password = localStorage.getItem('password') || '';
      this.rememberMe = true;
    }
  },
  methods: {
    goToRegister() {
      this.$router.push('/RegistrarApp');
    },
    handleLogin() {
      // Verifica si "Recuérdame" está marcado y guarda o limpia datos según corresponda
      if (this.rememberMe) {
        localStorage.setItem('email', this.email);
        localStorage.setItem('password', this.password);
        localStorage.setItem('rememberMe', true);
      } else {
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.setItem('rememberMe', false);
      }

      // Simulación de autenticación exitosa
      this.$router.push('/productos');
    }
  }
};
</script>

<style scoped>
  /* Bordered form */
  form {
    border: 3px solid #f1f1f1;
  }

  /* Full-width inputs */
  input[type=email], input[type=password] {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }

  /* Set a style for all buttons */
  button {
    background-color: #04AA6D;
    color: white;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
  }

  /* Add a hover effect for buttons */
  button:hover {
    opacity: 0.8;
  }

  .cancelbtn {
    padding: 14px 20px;
    background-color: #f44336;
  }

  /* Extra style for the cancel button (red) */
  .cancelbtn, .signupbtn {
    float: left;
    width: 50%;
  }

  /* Center the avatar image inside this container */
  .Bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30px;
    border-bottom: 2px solid #f1f1f1;
  }

  /* Título centrado verticalmente */
  .Bar h1 {
    font-size: 24px;
  }
  h1 {
    margin-left: 20px;
  }
  .Bar {
    margin-right: 20px;
  }

  /* Avatar image */
  img.avatar {
    width: 10%;
  }

  /* Add padding to containers */
  .container {
    padding: 16px;
  }

  /* The "Forgot password" text */
  span.psw {
    float: right;
    padding-top: 16px;
  }

  .clearfix::after {
    content: "";
    clear: both;
    display: table;
  }

  /* Change styles for span and cancel button on extra small screens */
  @media screen and (max-width: 500px) {
    span.psw {
      display: block;
      float: none;
    }
    img.avatar {
      width: 20%;
    }
  }
</style>
