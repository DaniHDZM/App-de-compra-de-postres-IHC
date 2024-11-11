<template>
  <div class="EnvioApp">
    <h2>Envío</h2>
    <div class="dropdowns">
      <!-- Dropdown para Facultad -->
      <label for="facultad">Facultad</label>
      <select v-model="selectedFacultad" id="facultad">
        <option value="" disabled>Selecciona una facultad</option>
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
      <select v-model="selectedCampus" id="campus">
        <option value="" disabled>Selecciona un sitio</option>
        <option v-for="campus in campusSites" :key="campus" :value="campus">
          {{ campus }}
        </option>
      </select>
    </div>

    <!-- Botón para hacer pedido -->
    <button @click="makeOrder" class="order-button">Hacer Pedido</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      facultades: [
        "Facultad de Ciencias",
        "Facultad de Telemática",
        "Facultad de Administración",
      ],
      campusSites: ["Servicios", "CEI"],
      selectedFacultad: "",
      selectedCampus: "",
    };
  },
  methods: {
    makeOrder() {
      if (this.selectedFacultad && this.selectedCampus) {
        this.$router.push("/ConfirmacionApp"); // Redirige a la página de confirmación
      } else {
        alert("Por favor selecciona una facultad o un sitio del campus.");
      }
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
}
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
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
</style>
