<template>
  <form @submit.prevent="handleRegister">
    <div class="Bar">
      <h1>Crea tu perfil</h1>
      <img src="../imagenes/CESARS BAKERY.png" alt="Avatar" class="avatar">

      </div>
    <div class="container">
      

      <label for="email"><b>Email</b></label>
      <input type="email" placeholder="Coloca tu email" name="email" v-model="email" required>

      <label for="name"><b>Nombre</b></label>
      <input type="text" placeholder="Coloca tu nombre" name="name" v-model="name" required>

      <label for="psw"><b>Contraseña</b></label>
      <input type="password" placeholder="Coloca tu contraseña" name="psw" v-model="password" required>

      <label for="psw-repeat"><b>Confirmar contraseña</b></label>
      <input type="password" placeholder="Confirmar contraseña" name="psw-repeat" v-model="passwordRepeat" required>

      <!-- Mostrar mensaje de error si las contraseñas no coinciden -->
      <p v-if="passwordError" class="error">{{ passwordError }}</p>

      <label>
        <input type="checkbox" v-model="rememberMe"> Recuérdame
      </label>

      <div class="clearfix">
        <button type="button" class="cancelbtn" @click="goToReSingIn">Ir a iniciar sesión</button>
        <button type="submit" class="signupbtn">Crear cuenta</button>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'RegistrarApp',
  data() {
    return {
      email: '',
      name: '',
      password: '',
      passwordRepeat: '',
      rememberMe: false, // Estado del checkbox
      passwordError: '' // Mensaje de error si las contraseñas no coinciden
    };
  },
  methods: {
    goToReSingIn() {
      this.$router.push('/');
    },
    handleRegister() {
      // Verificar que las contraseñas coincidan
      if (this.password !== this.passwordRepeat) {
        this.passwordError = "Las contraseñas no coinciden"; // Mostrar mensaje de error
        return; // Salir de la función sin registrar
      } else {
        this.passwordError = ""; // Limpiar el mensaje de error si coinciden
      }

      // Guardar en localStorage si el checkbox "Recuérdame" está marcado
      if (this.rememberMe) {
        localStorage.setItem('email', this.email);
        localStorage.setItem('password', this.password);
        localStorage.setItem('rememberMe', true);
      } else {
        // Limpiar localStorage si el checkbox no está marcado
        localStorage.removeItem('email');
        localStorage.removeItem('password');
        localStorage.setItem('rememberMe', false);
      }

      // Redirigir al usuario después del registro
      this.$router.push('/Productos');
    }
  }
};
</script>

<style scoped>
body {font-family: Arial, Helvetica, sans-serif;}
* {box-sizing: border-box}

/* Full-width input fields */
input[type=text], input[type=password], input[type=email] {
  width: 100%;
  padding: 15px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Error message styling */
.error {
  color: red;
  font-size: 14px;
  margin-bottom: 10px;
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
  opacity: 0.9;
}

button:hover {
  opacity:1;
}

/* Extra styles for the cancel button */
.cancelbtn {
  padding: 14px 20px;
  background-color: #f44336;
}

/* Float cancel and signup buttons and add an equal width */
.cancelbtn, .signupbtn {
  float: left;
  width: 50%;
}

/* Add padding to container elements */
.container {
  padding: 16px;
}

/* Clear floats */
.clearfix::after {
  content: "";
  clear: both;
  display: table;
}
.Bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30px;
    border-bottom: 2px solid #f1f1f1;
    background-color: #800080;
  }
  img.avatar {
    width: 150px; /* Tamaño de la imagen */
    height: 150px;
    border-radius: 50%;
    margin-right: 20px;
  }
  h1 {
    margin-left: 20px;
    color: #f1f1f1;
  }

/* Change styles for cancel button and signup button on extra small screens */
@media screen and (max-width: 500px) {
  .cancelbtn, .signupbtn {
     width: 100%;
  }
  img.avatar {
    width: 50px;
    height: auto;
  }
}
</style>
