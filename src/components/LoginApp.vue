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

      <p v-if="loginError" class="error-message">{{ loginError }}</p>

      <div class="clearfix">
        <button type="button" class="cancelbtn" @click="goToRegister">Ir a registrarse</button>
        <button type="submit" class="signupbtn" :disabled="isLoading">
          {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import { supabase } from '../supabase'

export default {
  name: 'LoginApp',
  data() {
    return {
      email: '',
      password: '',
      loginError: '',
      isLoading: false
    };
  },
  methods: {
    goToRegister() {
      this.$router.push('/RegistrarApp');
    },
    async handleLogin() {
      this.loginError = '';
      this.isLoading = true;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password
        });

        if (error) {
          throw error;
        }

        const user = data.user;

        if (user) {
          // MODIFICACIÓN CRÍTICA AQUÍ: Cambia 'id' por 'user_id'
          const { data: profileData, error: profileError } = await supabase
            .from('usuarios')
            .select('role')
            .eq('user_id', user.id) // <--- CAMBIADO DE 'id' A 'user_id'
            .single();

          if (profileError) {
            this.loginError = 'Error al obtener el rol del usuario. Intenta de nuevo.';
            // Still redirect to products as a fallback if role can't be determined
            this.$router.push('/Productos');
            return;
          }

          if (profileData && profileData.role === 'admin') {
            this.$router.push('/Admin');
          } else {
            this.$router.push('/Productos');
          }
        } else {
          this.loginError = 'No se pudo obtener la información del usuario. Intenta de nuevo.';
        }

      } catch (error) {
        if (error.message.includes('Invalid login credentials')) {
          this.loginError = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          this.loginError = 'Por favor, confirma tu correo electrónico antes de iniciar sesión.';
        } else {
          this.loginError = 'Error al iniciar sesión: ' + error.message;
        }
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
  /* Existing styles are kept */
  form {
    border: 3px solid #f1f1f1;
  }

  input[type=email], input[type=password] {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }

  button {
    background-color: #04AA6D;
    color: white;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
  }

  button:hover {
    opacity: 0.8;
  }

  button:disabled { /* Style for disabled button */
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #a0a0a0;
  }

  .cancelbtn {
    padding: 14px 20px;
    background-color: #f44336;
  }

  .cancelbtn, .signupbtn {
    float: left;
    width: 50%;
  }

  .Bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30px;
    border-bottom: 2px solid #f1f1f1;
    background-color: #800080;
  }

  h1 {
    margin-left: 20px;
    color: #f1f1f1;
  }

  img.avatar {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-right: 20px;
  }

  .container {
    padding: 16px;
  }

  span.psw {
    float: right;
    padding-top: 16px;
  }

  .clearfix::after {
    content: "";
    clear: both;
    display: table;
  }

  .error-message { /* Style for error message */
    color: #dc3545;
    margin-top: 10px;
    text-align: center;
    font-size: 0.9em;
  }

  @media screen and (max-width: 500px) {
    span.psw {
      display: block;
      float: none;
    }
    img.avatar {
      width: 50px;
      height: auto;
    }
  }
</style>