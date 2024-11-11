<template>
  <div class="EnvioApp">
    <h2>Envío</h2>
    <div class="dropdowns">
      <!-- Dropdown para Facultad -->
      <label for="facultad">Facultad</label>
      <select v-model="selectedFacultad" id="facultad" class="styled-select">
        <option value="">Ninguna</option>
        <!-- Opción predeterminada -->
        <option
          v-for="facultad in facultades"
          :key="facultad"
          :value="facultad"
        >
          {{ facultad }}
        </option>
      </select>

      <!-- Dropdown para Sitio del Campus -->
      <label for="campus">Sitio del Campus</label>
      <select v-model="selectedCampus" id="campus" class="styled-select">
        <option value="">Ninguna</option>
        <!-- Opción predeterminada -->
        <option v-for="campus in campusSites" :key="campus" :value="campus">
          {{ campus }}
        </option>
      </select>
    </div>

    <!-- Botón para hacer pedido -->
    <button @click="makeOrder" class="order-button">Hacer Pedido</button>
    <button @click="goBack" class="back-button">Regresar</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      facultades: ["Facultad de Ciencias", "Facultad de Telemática"],
      campusSites: ["Servicios", "CEI"],
      selectedFacultad: "",
      selectedCampus: "",
    };
  },
  methods: {
    makeOrder() {
      this.$router.push("/ConfirmacionApp"); // Redirige a la página de confirmación
    },
    goBack() {
      this.$router.back(); // Esto te llevará a la página anterior en la historia
    },
  },
};
</script>

<style scoped>
.checkout {
  max-width: 500px;
  margin: auto;
  text-align: center;
}
h2 {
  margin-bottom: 20px;
}
.dropdowns {
  margin-bottom: 20px;
}
label {
  display: block;
  margin: 10px 0 5px;
  font-weight: bold;
}
.styled-select {
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 2px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  font-size: 16px;
  color: #333;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
.styled-select:focus {
  border-color: #007bff;
  outline: none;
  background-color: #fff;
}
.order-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
.order-button:hover {
  background-color: #0056b3;
}
.back-button {
  padding: 8px 16px;
  background-color: red;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 20px;
}
.back-button:hover {
  background-color: red;
}
</style>
