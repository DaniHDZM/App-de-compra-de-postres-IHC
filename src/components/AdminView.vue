<template>
    <div class="admin-container">
      <header class="admin-header">
        <h2>Administración de Productos</h2>
        <button @click="handleLogout" class="logout-button">Cerrar Sesión</button>
      </header>
  
      <div v-if="!isAdmin" class="access-denied">
        <p>Acceso denegado. Solo los administradores pueden acceder a esta vista.</p>
        <button @click="$router.push('/')" class="secondary-button">Ir a Inicio</button>
      </div>
  
      <div v-else>
        <div class="form-section">
          <h3>{{ editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto' }}</h3>
          <form @submit.prevent="handleSubmitProduct">
            <div class="form-group">
              <label for="nombre">Nombre:</label>
              <input type="text" id="nombre" v-model="productForm.nombre" required />
            </div>
            <div class="form-group">
              <label for="descripcion">Descripción:</label>
              <textarea id="descripcion" v-model="productForm.descripcion" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="precio">Precio:</label>
              <input type="number" id="precio" v-model.number="productForm.precio" required min="0" step="1" />
            </div>
            <div class="form-group">
              <label for="stock">Stock:</label>
              <input type="number" id="stock" v-model.number="productForm.stock" required min="0" step="1" />
            </div>
            <div class="form-group">
              <label for="imagen">Imagen:</label>
              <input type="file" id="imagen" @change="handleImageUpload" accept="image/*" />
              <p v-if="imageFileName">Archivo seleccionado: {{ imageFileName }}</p>
              
              <img v-if="previewImageUrl" :src="previewImageUrl" alt="Imagen del producto" class="product-image-preview" />
              <p v-else-if="productForm.imagen && !selectedImageFile">Imagen actual sin previsualización.</p>
            </div>
  
            <button type="submit" :disabled="isLoading">
              {{ isLoading ? 'Guardando...' : (editingProduct ? 'Guardar Cambios' : 'Añadir Producto') }}
            </button>
            <button v-if="editingProduct" type="button" @click="cancelEdit" class="secondary-button">Cancelar Edición</button>
          </form>
          <p v-if="formError" class="error-message">{{ formError }}</p>
          <p v-if="formSuccess" class="success-message">{{ formSuccess }}</p>
        </div>
  
        <div class="product-list-section">
          <h3>Productos Existentes</h3>
          <p v-if="loadingProducts">Cargando productos...</p>
          <p v-if="productsError" class="error-message">{{ productsError }}</p>
          
          <table v-if="products.length > 0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Imagen</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id_producto">
                <td>{{ product.id_producto }}</td>
                <td>{{ product.nombre }}</td>
                <td>{{ product.descripcion }}</td>
                <td>${{ product.precio }}</td>
                <td>{{ product.stock }}</td>
                <td>
                  <img v-if="product.imagen" :src="product.imagen" alt="Producto" class="product-thumbnail" />
                  <span v-else>Sin imagen</span>
                </td>
                <td>
                  <button @click="editProduct(product)" class="edit-button">Editar</button>
                  <button @click="confirmDelete(product.id_producto)" class="delete-button">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else-if="!loadingProducts">No hay productos para mostrar.</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { supabase } from '@/supabase';
  import { v4 as uuidv4 } from 'uuid';
  
  export default {
    name: 'AdminView',
    data() {
      return {
        products: [],
        loadingProducts: false,
        productsError: '',
  
        productForm: {
          id_producto: null,
          nombre: '',
          descripcion: '',
          precio: null,
          stock: null,
          imagen: ''
        },
        selectedImageFile: null,
        imageFileName: '',
        previewImageUrl: '',
  
        editingProduct: false,
        isLoading: false,
        formError: '',
        formSuccess: '',
  
        isAdmin: false,
      };
    },
    async created() {
      await this.checkUserRole();
      if (this.isAdmin) {
        this.fetchProducts();
      }
    },
    methods: {
      async checkUserRole() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            this.isAdmin = false;
            // Opcional: Redirigir a la página de inicio de sesión si no hay usuario
            this.$router.push('/'); 
            return;
          }
  
          const { data, error } = await supabase
          .from('usuarios')
          .select('role')
          .eq('user_id', user.id)
          .single();
  
          if (error) {
            console.error("Error al obtener el rol del usuario:", error);
            this.isAdmin = false;
            // Opcional: Redirigir si hay un error al obtener el rol
            this.$router.push('/'); 
            return;
          }
  
          this.isAdmin = data.role === 'admin';
          if (!this.isAdmin) {
              console.warn("Usuario no es administrador. Acceso denegado.");
              // Si no es admin, redirigir a una página no administrativa
              this.$router.push('/Productos'); 
          }
        } catch (error) {
          console.error("Error general al comprobar el rol del usuario:", error);
          this.isAdmin = false;
          this.$router.push('/'); 
        }
      },
      
      async fetchProducts() {
        this.loadingProducts = true;
        this.productsError = '';
        try {
          const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('id_producto', { ascending: true });
  
          if (error) {
            throw error;
          }
  
          this.products = await Promise.all(
            data.map(async (product) => {
              if (product.imagen) {
                product.imagen = await this.getSignedUrl(product.imagen);
              }
              return product;
            })
          );
  
        } catch (error) {
          this.productsError = 'Error al cargar productos: ' + error.message;
          console.error('Error fetching products:', error);
        } finally {
          this.loadingProducts = false;
        }
      },
  
      async getSignedUrl(filePath) {
        if (!filePath) {
            return '';
        }
        try {
            const { data, error } = await supabase.storage
                .from('product-images')
                .createSignedUrl(filePath, 60);
  
            if (error) {
                console.error('Error al obtener URL firmada:', error);
                return '';
            }
            return data.signedUrl;
        } catch (error) {
            console.error('Error general al obtener URL firmada:', error);
            return '';
        }
      },
  
      handleImageUpload(event) {
        this.selectedImageFile = event.target.files[0];
        if (this.selectedImageFile) {
          this.imageFileName = this.selectedImageFile.name;
          this.previewImageUrl = URL.createObjectURL(this.selectedImageFile);
        } else {
          this.imageFileName = '';
          this.previewImageUrl = '';
        }
      },
  
      async uploadImage() {
        if (!this.selectedImageFile) {
          return null;
        }
  
        const fileExtension = this.selectedImageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `product-images/${fileName}`;
  
        try {
          const { error } = await supabase.storage
            .from('product-images')
            .upload(filePath, this.selectedImageFile, {
              cacheControl: '3600',
              upsert: false
            });
  
          if (error) {
            throw error;
          }
  
          return filePath;
  
        } catch (error) {
          console.error('Error al subir imagen:', error);
          this.formError = 'Error al subir imagen: ' + error.message;
          return null;
        }
      },
  
      async handleSubmitProduct() {
        this.isLoading = true;
        this.formError = '';
        this.formSuccess = '';
  
        try {
          let imageFilePath = this.productForm.imagen;
  
          if (this.selectedImageFile) {
            imageFilePath = await this.uploadImage();
            if (!imageFilePath) {
              this.isLoading = false;
              return;
            }
          }
  
          const productData = {
            nombre: this.productForm.nombre,
            descripcion: this.productForm.descripcion,
            precio: this.productForm.precio,
            stock: this.productForm.stock,
            imagen: imageFilePath
          };
  
          if (this.editingProduct) {
            const { error } = await supabase
              .from('productos')
              .update(productData)
              .eq('id_producto', this.productForm.id_producto);
  
            if (error) {
              throw error;
            }
            this.formSuccess = 'Producto actualizado exitosamente.';
          } else {
            const { error } = await supabase
              .from('productos')
              .insert(productData);
  
            if (error) {
              throw error;
            }
            this.formSuccess = 'Producto añadido exitosamente.';
          }
  
          this.resetForm();
          this.fetchProducts();
        } catch (error) {
          this.formError = 'Error al guardar producto: ' + error.message;
          console.error('Error saving product:', error);
        } finally {
          this.isLoading = false;
        }
      },
  
      async editProduct(product) {
        this.editingProduct = true;
        this.productForm = { ...product };
        
        this.selectedImageFile = null;
        this.imageFileName = '';
        this.formError = '';
        this.formSuccess = '';
        
        if (product.imagen) {
            this.previewImageUrl = await this.getSignedUrl(product.imagen);
        } else {
            this.previewImageUrl = '';
        }
  
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
  
      cancelEdit() {
        this.resetForm();
        this.editingProduct = false;
      },
  
      async confirmDelete(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
          await this.deleteProduct(id);
        }
      },
  
      async deleteProduct(id) {
        this.isLoading = true;
        this.formError = '';
        this.formSuccess = '';
        try {
          const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id_producto', id);
  
          if (error) {
            throw error;
          }
          this.formSuccess = 'Producto eliminado exitosamente.';
          this.fetchProducts();
        } catch (error) {
          this.formError = 'Error al eliminar producto: ' + error.message;
          console.error('Error deleting product:', error);
        } finally {
          this.isLoading = false;
        }
      },
  
      resetForm() {
        this.productForm = {
          id_producto: null,
          nombre: '',
          descripcion: '',
          precio: null,
          stock: null,
          imagen: ''
        };
        this.selectedImageFile = null;
        this.imageFileName = '';
        this.previewImageUrl = '';
        this.editingProduct = false;
        this.formError = '';
        this.formSuccess = '';
      },
      
      async handleLogout() {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          // Limpiar cualquier estado local o caché
          this.isAdmin = false;
          this.products = [];
          this.resetForm(); // Limpiar el formulario y otros estados
          // Redirigir a la página de inicio de sesión o a la página principal
          this.$router.push('/');
        } catch (error) {
          console.error("Error al cerrar sesión:", error.message);
          alert("Hubo un problema al cerrar sesión: " + error.message);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-container {
    max-width: 900px;
    margin: 50px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  h2 {
    color: #333;
    margin: 0;
  }
  
  .logout-button {
    background-color: #dc3545; /* Rojo para cerrar sesión */
    color: white;
    padding: 8px 15px;
    border-radius: 5px;
    font-size: 14px;
    transition: background-color 0.3s ease;
  }
  
  .logout-button:hover {
    background-color: #c82333;
  }
  
  .access-denied {
      text-align: center;
      padding: 30px;
      background-color: #ffe0e0;
      border: 1px solid #dc3545;
      border-radius: 5px;
      color: #dc3545;
      margin-top: 30px;
  }
  
  .access-denied button {
      margin-top: 20px;
  }
  
  .form-section, .product-list-section {
    margin-bottom: 40px;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  
  h3 {
    text-align: center;
    color: #333;
    margin-bottom: 25px;
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
  
  input[type="text"],
  input[type="number"],
  textarea {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  
  input[type="file"] {
      padding: 8px 0;
  }
  
  .product-image-preview {
      max-width: 150px;
      height: auto;
      margin-top: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      display: block;
  }
  
  button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-right: 10px;
    transition: background-color 0.3s ease;
  }
  
  button[type="submit"] {
    background-color: #28a745;
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
    background-color: #6c757d;
    color: white;
  }
  
  .secondary-button:hover {
    background-color: #5a6268;
  }
  
  .edit-button {
    background-color: #ffc107;
    color: #333;
    margin-right: 5px;
  }
  
  .edit-button:hover {
    background-color: #e0a800;
  }
  
  .delete-button {
    background-color: #dc3545;
    color: white;
  }
  
  .delete-button:hover {
    background-color: #c82333;
  }
  
  .error-message {
    color: #dc3545;
    margin-top: 15px;
    font-size: 0.9em;
    text-align: center;
  }
  
  .success-message {
    color: #28a745;
    margin-top: 15px;
    font-size: 0.9em;
    text-align: center;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  .product-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }
  </style>