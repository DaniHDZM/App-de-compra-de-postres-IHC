<template>
  <div class="Bar">
    <h1>Inicia sesión</h1>

    <img src="../imagenes/CESARS BAKERY.png" alt="Avatar" class="avatar">
  </div>
    <form>
  

  <div class="container">
    <label for="uname"><b>Email</b></label>
    <input type="email" placeholder="Enter Email" name="uname" required>

    <label for="psw"><b>Password</b></label>
    <input type="password" placeholder="Enter Password" name="psw" required>

    <div class="clearfix">
      <button type="button" class="cancelbtn" @click="goToRegister">Ir a registrarse</button>
      <button type="submit" class="signupbtn" >Iniciar Sesión</button>
    </div>
  </div>
  
</form>
</template>

<script>
export default {
  name: 'LoginApp',
  data() {

  },

  methods: {
    goToRegister() {
      this.$router.push('/RegistarApp');
    }
}
}

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