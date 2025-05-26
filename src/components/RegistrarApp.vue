<template>
  <div class="register-container">
    <h2>Crea tu perfil</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email" required>
      </div>

      <div class="form-group">
        <label for="nombre">Nombre</label>
        <input type="text" id="nombre" v-model="nombre" required>
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" v-model="password" required @input="validatePassword">
        <small class="password-requirements">
          La contraseña debe tener:
          <ul>
            <li :class="{ 'valid-requirement': password.length >= 8 }">Mínimo 8 caracteres</li>
            <li :class="{ 'valid-requirement': /[A-Z]/.test(password) }">Al menos una mayúscula</li>
            <li :class="{ 'valid-requirement': /[0-9]/.test(password) }">Al menos un número</li>
            <li :class="{ 'valid-requirement': /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password) }">Al menos un carácter especial</li>
          </ul>
        </small>
      </div>
      
      <div class="form-group">
        <label for="passwordRepeat">Confirmar contraseña</label>
        <input type="password" id="passwordRepeat" v-model="passwordRepeat" required @input="validatePassword">
      </div>

      <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      <p v-if="registerError" class="error-message">{{ registerError }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <button type="submit" :disabled="isLoading || !isPasswordValid || password !== passwordRepeat">
        {{ isLoading ? 'Registrando...' : 'Crear cuenta' }}
      </button>
      <button type="button" @click="goToSignIn" :disabled="isLoading" class="secondary-button">
        Ya tengo una cuenta (Iniciar Sesión)
      </button>
    </form>
  </div>
</template>

<script>
import { supabase } from '@/supabase';

export default {
  name: 'RegistrarApp',
  data() {
    return {
      email: '',
      nombre: '',
      password: '',
      passwordRepeat: '',
      passwordError: '',
      registerError: '',
      successMessage: '',
      isLoading: false,
      isPasswordValid: false, // Nuevo: para controlar el estado de validación de la contraseña
    };
  },
  methods: {
    goToSignIn() {
      this.$router.push('/');  
    },
    
    validatePassword() {
      this.passwordError = ''; // Limpiar errores previos

      const p = this.password;
      let isValid = true;
      const requirements = [];

      if (p.length < 8) {
        isValid = false;
        requirements.push("La contraseña debe tener al menos 8 caracteres.");
      }
      if (!/[A-Z]/.test(p)) {
        isValid = false;
        requirements.push("La contraseña debe contener al menos una letra mayúscula.");
      }
      if (!/[0-9]/.test(p)) {
        isValid = false;
        requirements.push("La contraseña debe contener al menos un número.");
      }
      // Esta regex cubre una amplia gama de caracteres especiales comunes
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(p)) {
        isValid = false;
        requirements.push("La contraseña debe contener al menos un carácter especial.");
      }

      if (p !== this.passwordRepeat && this.passwordRepeat !== '') {
        isValid = false;
        requirements.push("Las contraseñas no coinciden.");
      }

      if (requirements.length > 0) {
        this.passwordError = requirements.join(' '); // Unir todos los mensajes de error
      } else {
        this.passwordError = '';
      }

      this.isPasswordValid = isValid && (p === this.passwordRepeat); // Asegurar que las contraseñas coincidan
    },

    async handleRegister() {
      this.passwordError = '';
      this.registerError = '';
      this.successMessage = '';
      this.isLoading = true;

      // Volver a validar la contraseña antes de enviar
      this.validatePassword();
      if (!this.isPasswordValid) {
        this.isLoading = false;
        return;
      }
      
      try {
        console.log('--- Inicio de registro ---');
        console.log('Intentando crear usuario en Supabase Auth con email:', this.email);

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: this.email,
          password: this.password,
        });

        if (signUpError) {
          console.error('Error durante signUp:', signUpError);
          if (signUpError.message.includes('User already registered')) {
            this.registerError = "Este email ya está registrado. Por favor, inicia sesión.";
          } else {
            this.registerError = `Error al registrar: ${signUpError.message}`;
          }
          return;
        }

        console.log('Resultado de signUp:', signUpData);

        let currentUser = signUpData.user;
        let currentSession = signUpData.session;

        if (!currentSession && currentUser) { 
            console.warn('Advertencia: Sesión nula después de signUp pero usuario creado. Intentando signInWithPassword para asegurar sesión activa...');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: this.email,
                password: this.password,
            });

            if (signInError) {
                console.error('Error durante signIn después de signUp (contingencia):', signInError);
                this.registerError = `Registro exitoso, pero no se pudo iniciar sesión automáticamente: ${signInError.message}. Por favor, intenta iniciar sesión manualmente.`;
                return;
            }
            currentUser = signInData.user;
            currentSession = signInData.session;
            console.log('Resultado de signInWithPassword (contingencia):', signInData);
        }

        if (!currentUser || !currentSession) {
          console.error('Fallo crítico: No se pudo establecer la sesión del usuario después del registro.');
          this.registerError = "Error interno: No se pudo establecer la sesión del usuario para completar el perfil. Por favor, inicia sesión manualmente.";
          return;
        }

        console.log('Sesión activa y usuario obtenido:', currentUser, currentSession);

        console.log('Intentando insertar perfil en tabla "usuarios" con ID:', currentUser.id);
        const { data: profileData, error: profileError } = await supabase
            .from('usuarios')
            .insert({
              user_id: currentUser.id,
              nombre: this.nombre,
              correo: this.email,
              role: 'User'
            })
            .select();

        if (profileError) {
          console.error('Error al insertar perfil en tabla "usuarios":', profileError);
          this.registerError = `Error al guardar perfil: ${profileError.message}. El usuario fue creado en autenticación, pero no en la tabla personalizada.`;
          return;
        }

        console.log('Perfil insertado exitosamente en tabla "usuarios":', profileData);
        this.successMessage = "¡Cuenta creada y perfil guardado exitosamente!";
        console.log('Redirigiendo a /productos...');
        setTimeout(() => {
          this.$router.push('/productos');
        }, 2000);

      } catch (generalError) {
        console.error('Error inesperado en handleRegister:', generalError);
        this.registerError = `Error inesperado: ${generalError.message}`;
      } finally {
        this.isLoading = false;
        console.log('--- Fin de registro ---');
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="email"],
input[type="text"],
input[type="password"] {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

button[type="submit"] {
  background-color: #28a745; /* Verde para Crear cuenta */
  color: white;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #218838;
}

button[type="submit"]:disabled {
  background-color: #90ee90;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #007bff; /* Azul para Iniciar sesión */
  color: white;
}

.secondary-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: #dc3545;
  margin-top: 10px;
  font-size: 0.9em;
  text-align: center;
}

.success-message {
  color: #28a745;
  margin-top: 10px;
  font-size: 0.9em;
  text-align: center;
}

/* Nuevos estilos para los requisitos de contraseña */
.password-requirements {
  font-size: 0.85em;
  color: #666;
  margin-top: 5px;
  text-align: left;
}

.password-requirements ul {
  list-style: none; /* Quita los puntos de la lista */
  padding-left: 0;
  margin-top: 5px;
}

.password-requirements li {
  margin-bottom: 3px;
  color: #dc3545; /* Rojo por defecto si no cumple */
}

.password-requirements li.valid-requirement {
  color: #28a745; /* Verde si cumple el requisito */
}
</style>