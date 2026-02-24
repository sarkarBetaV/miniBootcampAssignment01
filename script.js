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

// ========== RENDER MAIN CONTENT ==========
function renderMainContent() {
  // Create main content HTML
  dynamicContent.innerHTML = `
        
<section class="py-8 bg-gray-100">
    <div class="container mx-auto px-4">
        <h2 class="text-2xl font-bold text-center mb-6">Our Products</h2>
        <div class="flex flex-wrap gap-3 justify-center" id="categoryButtons">
            <button class="category-btn px-6 py-2 rounded-full bg-blue-600 text-white font-medium transition" data-category="all">All Products</button>
            ${state.categories
              .map(
                (cat) => `
                <button class="category-btn px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition" data-category="${cat}">
                    ${cat}
                </button>
            `,
              )
              .join("")}
        </div>
    </div>
</section>

        <!-- Products Grid Section -->
        <section class="py-8">
            <div class="container mx-auto px-4">
                <h2 class="text-2xl font-bold mb-6" id="productsHeading">All Products</h2>
                <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    ${renderProducts()}
                </div>
            </div>
        </section>

        <!-- Cart Sidebar (Hidden by default) -->
<div id="cartSidebar" class="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform translate-x-full transition-transform duration-300 z-50 overflow-y-auto">
    <div class="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
        <h3 class="text-xl font-bold">Your Cart</h3>
        <button id="closeCart" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
        </button>
    </div>
    <div id="cartItems" class="p-4">
        ${renderCartItems()}
    </div>
    <div class="sticky bottom-0 bg-white p-4 border-t">
        <div class="flex justify-between mb-4">
            <span class="font-bold">Total:</span>
            <span class="font-bold text-blue-600">$${calculateCartTotal().toFixed(2)}</span>
        </div>
        <button id="checkoutBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2">
            <i class="fas fa-lock text-sm"></i>
            Proceed to Checkout
        </button>
        <p class="text-xs text-gray-500 text-center mt-3">
            Secure checkout powered by SwiftCart
        </p>
    </div>
</div>

<!-- Checkout Modal/Page -->
<div id="checkoutModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 overflow-y-auto">
    <div class="bg-white rounded-lg max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div class="p-8">
            <div class="flex justify-between items-start mb-8">
                <h2 class="text-3xl font-bold">Checkout</h2>
                <button id="closeCheckout" onclick="closeCheckout()" class="text-gray-500 hover:text-gray-700">
    <i class="fas fa-times text-2xl"></i>
</button>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Checkout Form - Left Column -->
                <div class="lg:col-span-1">
                    <form id="checkoutForm">
                        <!-- Contact Information -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-6 pb-2 border-b">Contact Information</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                    <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="John">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                    <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="Doe">
                                </div>
                            </div>
                            <div class="mt-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <input type="email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="john@example.com">
                            </div>
                            <div class="mt-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                <input type="tel" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="+1 234 567 890">
                            </div>
                        </div>
                        
                        <!-- Shipping Address -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-6 pb-2 border-b">Shipping Address</h3>
                            <div class="grid grid-cols-1 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                                    <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="123 Main St">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                                    <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="Apt, Suite, etc.">
                                </div>
                                <div class="grid grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                        <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="New York">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                                        <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="NY">
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code *</label>
                                        <input type="text" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="10001">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                                        <select required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base">
                                            <option value="">Select Country</option>
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="AU">Australia</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Payment Method -->
                        <div class="mb-8">
                            <h3 class="text-xl font-semibold mb-6 pb-2 border-b">Payment Method</h3>
                            <div class="space-y-4">
                                <label class="flex items-center p-5 border rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input type="radio" name="payment" value="credit" class="h-5 w-5 text-blue-600" checked>
                                    <div class="ml-4">
                                        <span class="font-medium text-lg">Credit Card</span>
                                        <div class="flex gap-3 mt-2">
                                            <i class="fab fa-cc-visa text-3xl text-blue-600"></i>
                                            <i class="fab fa-cc-mastercard text-3xl text-red-600"></i>
                                            <i class="fab fa-cc-amex text-3xl text-blue-400"></i>
                                            <i class="fab fa-cc-discover text-3xl text-orange-500"></i>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="flex items-center p-5 border rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input type="radio" name="payment" value="paypal" class="h-5 w-5 text-blue-600">
                                    <div class="ml-4">
                                        <span class="font-medium text-lg">PayPal</span>
                                        <i class="fab fa-paypal text-3xl text-blue-700 ml-3"></i>
                                    </div>
                                </label>
                                
                                <label class="flex items-center p-5 border rounded-lg cursor-pointer hover:border-blue-500 transition">
                                    <input type="radio" name="payment" value="cash" class="h-5 w-5 text-blue-600">
                                    <div class="ml-4">
                                        <span class="font-medium text-lg">Cash on Delivery</span>
                                        <p class="text-sm text-gray-500 mt-1">Pay when you receive your order</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Credit Card Details (shown only when credit card is selected) -->
                        <div id="creditCardDetails" class="mb-8 p-6 bg-gray-50 rounded-lg border">
                            <h4 class="font-semibold text-lg mb-4">Card Details</h4>
                            <div class="grid grid-cols-1 gap-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                                    <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="1234 5678 9012 3456">
                                </div>
                                <div class="grid grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                                        <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="MM/YY">
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                        <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="123">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                                    <input type="text" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" placeholder="John Doe">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                
                <!-- Order Summary - Right Column (ENLARGED) -->
                <div class="lg:col-span-1">
                    <div class="bg-gray-50 rounded-xl p-8 sticky top-8 shadow-lg">
                        <h3 class="text-2xl font-bold mb-6 pb-4 border-b">Order Summary</h3>
                        
                        <!-- Cart Items Summary - ENLARGED -->
                        <div id="checkoutCartItems" class="space-y-5 mb-6 max-h-96 overflow-y-auto pr-2">
                            <!-- Items will be dynamically added here -->
                        </div>
                        
                        <!-- Price Breakdown - ENLARGED -->
                        <div class="border-t pt-6 space-y-4">
                            <div class="flex justify-between text-base">
                                <span class="text-gray-600">Subtotal</span>
                                <span id="checkoutSubtotal" class="font-medium text-lg">$0.00</span>
                            </div>
                            <div class="flex justify-between text-base">
                                <span class="text-gray-600">Shipping</span>
                                <span id="checkoutShipping" class="font-medium text-lg">$5.99</span>
                            </div>
                            <div class="flex justify-between text-base">
                                <span class="text-gray-600">Tax (10%)</span>
                                <span id="checkoutTax" class="font-medium text-lg">$0.00</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold pt-4 border-t mt-4">
                                <span>Total</span>
                                <span id="checkoutTotal" class="text-blue-600 text-2xl">$0.00</span>
                            </div>
                        </div>
                        
                        <!-- Place Order Button - ENLARGED -->
                        <button id="placeOrderBtn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition transform hover:scale-105 mt-8 text-lg shadow-md">
                            <i class="fas fa-lock mr-2"></i>
                            Place Order
                        </button>
                        
                        <!-- Trust Badges -->
                        <div class="mt-6 text-center">
                            <div class="flex justify-center gap-4 mb-3">
                                <i class="fab fa-cc-visa text-3xl text-gray-400"></i>
                                <i class="fab fa-cc-mastercard text-3xl text-gray-400"></i>
                                <i class="fab fa-cc-amex text-3xl text-gray-400"></i>
                                <i class="fab fa-cc-paypal text-3xl text-gray-400"></i>
                            </div>
                            <p class="text-xs text-gray-500">
                                By placing your order, you agree to our 
                                <a href="#" class="text-blue-600 hover:underline">Terms of Service</a> and 
                                <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>.
                            </p>
                            <p class="text-xs text-gray-500 mt-2">
                                <i class="fas fa-shield-alt text-green-600 mr-1"></i>
                                Secure SSL Encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Order Success Modal -->
<div id="successModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6 text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check-circle text-5xl text-green-600"></i>
        </div>
        <h2 class="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
        <p class="text-gray-600 mb-6">Thank you for your purchase. We'll send you an email with order details.</p>
        <div class="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p class="text-sm text-gray-600 mb-2">Order #: <span id="orderNumber" class="font-mono font-bold">SWIFT2024</span></p>
            <p class="text-sm text-gray-600">Estimated Delivery: <span id="estimatedDelivery" class="font-medium">3-5 business days</span></p>
        </div>
        <button id="continueShoppingBtn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
            Continue Shopping
        </button>
    </div>
</div>

    `;

  // Add event listeners
  addCategoryListeners();
  addProductListeners();
  addCartListeners();
}
