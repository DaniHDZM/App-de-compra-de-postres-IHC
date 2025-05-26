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
        <input type="password" id="password" v-model="password" required>
      </div>
      
      <div class="form-group">
        <label for="passwordRepeat">Confirmar contraseña</label>
        <input type="password" id="passwordRepeat" v-model="passwordRepeat" required>
      </div>

      <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      <p v-if="registerError" class="error-message">{{ registerError }}</p>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Registrando...' : 'Crear cuenta' }}
      </button>
      <button type="button" @click="goToSignIn" :disabled="isLoading" class="secondary-button">
        Ya tengo una cuenta (Iniciar Sesión)
      </button>
    </form>
  </div>
</template>

<script>
// Asegúrate de que la ruta a tu cliente Supabase sea correcta
import { supabase } from '@/supabase';

export default {
  name: 'RegistrarApp',
  data() {
    return {
      email: '',
      nombre: '', // Nuevo campo para el nombre del usuario
      password: '',
      passwordRepeat: '',
      passwordError: '', // Errores de validación de contraseña
      registerError: '', // Errores de Supabase Auth o inserción de perfil
      successMessage: '',
      isLoading: false
    };
  },
  methods: {
    goToSignIn() {
      // Asume que tienes una ruta a tu componente de inicio de sesión
      this.$router.push('/');  
    },
    
    async handleRegister() {
      // Limpiar mensajes y activar estado de carga
      this.passwordError = '';
      this.registerError = '';
      this.successMessage = '';
      this.isLoading = true;

      try {
        // --- Validaciones iniciales del formulario ---
        if (this.password !== this.passwordRepeat) {
          this.passwordError = "Las contraseñas no coinciden.";
          return;
        }
        if (this.password.length < 6) {
          this.passwordError = "La contraseña debe tener al menos 6 caracteres.";
          return;
        }

        console.log('--- Inicio de registro ---');
        console.log('Intentando crear usuario en Supabase Auth con email:', this.email);

        // --- Paso 1: Registrar usuario en Supabase Authentication ---
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: this.email,
          password: this.password,
          // Puedes añadir opciones adicionales como data (metadata de usuario) aquí si lo necesitas
          // options: {
          //   data: {
          //     full_name: this.nombre // Puedes pasar el nombre aquí si lo quieres en auth.users.raw_user_meta_data
          //   }
          // }
        });

        if (signUpError) {
          console.error('Error durante signUp:', signUpError);
          if (signUpError.message.includes('User already registered')) {
            this.registerError = "Este email ya está registrado. Por favor, inicia sesión.";
          } else {
            this.registerError = `Error al registrar: ${signUpError.message}`;
          }
          return; // Salir si hay error en el registro de autenticación
        }

        console.log('Resultado de signUp:', signUpData);

        let currentUser = signUpData.user;
        let currentSession = signUpData.session;

        // --- Lógica de Contingencia: Forzar sesión si no se obtuvo directamente (tu caso común) ---
        // Esto es útil si tu configuración de Supabase está configurada para requerir confirmación por email
        // y por lo tanto, signUp no inicia automáticamente la sesión.
        // Si no tienes confirmación por email y quieres que la sesión inicie inmediatamente,
        // esto es aún una buena medida de seguridad para asegurar que el usuario está logueado.
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

        // --- Verificación final de que tenemos un usuario y una sesión válidos ---
        if (!currentUser || !currentSession) {
          console.error('Fallo crítico: No se pudo establecer la sesión del usuario después del registro.');
          this.registerError = "Error interno: No se pudo establecer la sesión del usuario para completar el perfil. Por favor, inicia sesión manualmente.";
          return;
        }

        console.log('Sesión activa y usuario obtenido:', currentUser, currentSession);

        // --- Paso 2: Insertar perfil en la tabla 'usuarios' ---
        // Asegúrate de que las columnas aquí coincidan exactamente con tu tabla 'usuarios'
        console.log('Intentando insertar perfil en tabla "usuarios" con ID:', currentUser.id);
        const { data: profileData, error: profileError } = await supabase
            .from('usuarios')
            .insert({
              user_id: currentUser.id, // <-- Asegúrate de que esto inserte en la columna 'user_id'
              nombre: this.nombre,
              correo: this.email,
              role: 'User' // O el rol por defecto que quieras asignar
            })
            .select();

        if (profileError) {
          console.error('Error al insertar perfil en tabla "usuarios":', profileError);
          this.registerError = `Error al guardar perfil: ${profileError.message}. El usuario fue creado en autenticación, pero no en la tabla personalizada.`;
          // Opcional: Si el perfil falla, puedes intentar eliminar el usuario de Supabase Auth para evitar huérfanos.
          // Esto puede ser complejo y debe hacerse con cuidado, ya que el usuario podría haber confirmado el correo.
          return;
        }

        console.log('Perfil insertado exitosamente en tabla "usuarios":', profileData);
        this.successMessage = "¡Cuenta creada y perfil guardado exitosamente!";
        console.log('Redirigiendo a /productos...');
        setTimeout(() => {
          this.$router.push('/productos'); // Redirigir al usuario
        }, 2000);

      } catch (generalError) {
        console.error('Error inesperado en handleRegister:', generalError);
        this.registerError = `Error inesperado: ${generalError.message}`;
      } finally {
        this.isLoading = false; // Finalizar estado de carga
        console.log('--- Fin de registro ---');
      }
    }
  }
};
</script>

<style scoped>
/* Tus estilos CSS aquí, sin cambios. */
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
input[type="text"], /* Added type="text" for the name input */
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
</style>