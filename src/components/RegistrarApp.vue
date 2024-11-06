<template>
    <form >
    <div class="container">
    <h1>Crea tu perfil</h1>
    <hr>

    <label for="email"><b>Email</b></label>
    <input type="email" placeholder="Coloca tu email" name="email" required>
    
    <label for="name"><b>Nombre</b></label>
    <input type="text" placeholder="Coloca tu nombre" name="name" required>

    <label for="psw"><b>Contraseña</b></label>
    <input type="password" placeholder="Coloca tu contraseña" name="psw" required>

    <label for="psw-repeat"><b>Confirmar contraseña</b></label>
    <input type="password" placeholder="Confirmar contraseña" name="psw-repeat" required>
    

    <div class="clearfix">
      <button type="button" class="cancelbtn" @click="goToReSingIn">Ir a iniciar sesion</button>
      <button type="submit" class="signupbtn" >Crear cuenta</button>
    </div>
  </div>
</form>
</template>


<script>
export default {
  name: 'RegistrarApp',
  data() {

},
  methods: {
    goToReSingIn() {
      this.$router.push('/');
    }
  }
}
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

/* Change styles for cancel button and signup button on extra small screens */
@media screen and (max-width: 300px) {
  .cancelbtn, .signupbtn {
     width: 100%;
  }
}
</style>