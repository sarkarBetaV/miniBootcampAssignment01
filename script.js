// ========== STATE MANAGEMENT ==========
let state = {
  products: [],
  categories: [],
  cart: [],
  selectedCategory: "all",
  loading: true,
  modalOpen: false,
  selectedProduct: null,
  productsByCategory: {},
};

// DOM Elements
const app = document.getElementById("app");
const dynamicContent = document.getElementById("dynamic-content");

// ========== API FUNCTIONS ==========
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// ========== LOADING SPINNER ==========
function showLoadingSpinner(container) {
  if (container) {
    container.innerHTML = `
            <div class="flex flex-col justify-center items-center py-16">
                <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                <p class="text-gray-600 animate-pulse">Loading amazing products...</p>
            </div>
        `;
  }
}

function showProductsLoadingSpinner() {
  const productsGrid = document.getElementById("productsGrid");
  if (productsGrid) {
    productsGrid.innerHTML = `
            <div class="col-span-full flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <p class="text-gray-600 ml-3">Loading products...</p>
            </div>
        `;
  }
}

// ========== SKELETON LOADER FOR PRODUCTS ==========
function renderProductSkeleton() {
  return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div class="w-full h-48 bg-gray-300"></div>
            <div class="p-4">
                <div class="h-4 bg-gray-300 rounded mb-2"></div>
                <div class="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                <div class="flex justify-between items-center mb-2">
                    <div class="h-6 bg-gray-300 rounded w-20"></div>
                    <div class="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                <div class="flex items-center mb-3">
                    <div class="flex gap-1">
                        ${Array(5).fill('<div class="h-4 w-4 bg-gray-300 rounded"></div>').join("")}
                    </div>
                    <div class="h-4 w-8 bg-gray-300 rounded ml-2"></div>
                </div>
                <div class="flex gap-2">
                    <div class="flex-1 h-8 bg-gray-300 rounded"></div>
                    <div class="flex-1 h-8 bg-gray-300 rounded"></div>
                </div>
            </div>
        </div>
    `;
}

// ========== LOAD INITIAL DATA ==========
async function loadInitialData() {
  state.loading = true;

  // Show loading spinner in dynamic content
  showLoadingSpinner(dynamicContent);

  try {
    // Fetch all products and categories in parallel
    const [products, categories] = await Promise.all([
      fetchData("https://fakestoreapi.com/products"),
      fetchData("https://fakestoreapi.com/products/categories"),
    ]);

    if (products) {
      state.products = products;
    } else {
      showToast("Failed to load products. Please refresh the page.", "error");
    }

    if (categories) {
      state.categories = categories;
    } else {
      showToast("Failed to load categories.", "error");
    }
  } catch (error) {
    console.error("Error loading data:", error);
    showToast("Something went wrong. Please try again.", "error");
  } finally {
    state.loading = false;
    renderMainContent();
  }
}