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

function renderProducts(productsToRender = null) {
  let products = productsToRender || state.products;

  if (state.selectedCategory !== "all" && !productsToRender) {
    products = state.products.filter(
      (p) => p.category === state.selectedCategory,
    );
  }

  if (products.length === 0) {
    return '<p class="col-span-full text-center text-gray-500 py-8">No products found in this category.</p>';
  }

  return products
    .map(
      (product) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-contain p-4 hover:scale-105 transition duration-300">
            <div class="p-4">
                <h3 class="font-semibold mb-2 truncate" title="${product.title}">${product.title}</h3>
                <div class="flex justify-between items-center mb-2">
                    <span class="text-blue-600 font-bold">$${product.price}</span>
                    <span class="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">${product.category}</span>
                </div>
                <div class="flex items-center mb-3">
                    <div class="flex text-yellow-400">
                        ${renderStars(product.rating.rate)}
                    </div>
                    <span class="text-gray-500 text-sm ml-2">(${product.rating.count})</span>
                </div>
                <div class="flex gap-2">
                    <button class="details-btn flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded text-sm transition" data-id="${product.id}">
                        Details
                    </button>
                    <button class="add-to-cart-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded text-sm transition" data-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i === fullStars && hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }

  return stars;
}

// ========== CHECKOUT FUNCTIONS ==========

// Make functions globally accessible by attaching to window object
window.closeCheckout = closeCheckout;
window.openCheckout = openCheckout;
window.toggleCreditCardFields = toggleCreditCardFields;
window.placeOrder = placeOrder;

function openCheckout() {
  console.log("openCheckout called"); // Debug log

  if (!state.cart || state.cart.length === 0) {
    showToast("Your cart is empty! Add some items first.", "error");
    return;
  }

  const checkoutModal = document.getElementById("checkoutModal");
  if (!checkoutModal) {
    console.log("Checkout modal not found!");
    return;
  }

  // Update summary before showing modal
  updateCheckoutSummary();

  // Show modal
  checkoutModal.classList.remove("hidden");
  checkoutModal.classList.add("flex");
  document.body.style.overflow = "hidden"; // Prevent background scrolling

  // Close cart sidebar if open
  const cartSidebar = document.getElementById("cartSidebar");
  if (cartSidebar && !cartSidebar.classList.contains("translate-x-full")) {
    cartSidebar.classList.add("translate-x-full");
  }

  // Reset credit card fields visibility
  const creditRadio = document.querySelector(
    'input[name="payment"][value="credit"]',
  );
  if (creditRadio) {
    creditRadio.checked = true;
    toggleCreditCardFields();
  }

  console.log("Checkout modal opened successfully");
}

function closeCheckout() {
  console.log("closeCheckout called"); // Debug log

  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) {
    checkoutModal.classList.add("hidden");
    checkoutModal.classList.remove("flex");
    document.body.style.overflow = "auto"; // Restore scrolling

    // Reset form
    const form = document.getElementById("checkoutForm");
    if (form) {
      form.reset();
    }

    // Hide credit card details
    const creditCardDetails = document.getElementById("creditCardDetails");
    if (creditCardDetails) {
      creditCardDetails.classList.add("hidden");
    }

    console.log("Checkout modal closed successfully");
  } else {
    console.log("Checkout modal not found in closeCheckout");
  }
}

function updateCheckoutSummary() {
  console.log("Updating checkout summary"); // Debug log

  const checkoutCartItems = document.getElementById("checkoutCartItems");
  if (!checkoutCartItems) {
    console.log("Checkout cart items element not found");
    return;
  }

  const subtotal = calculateCartTotal();
  const shipping = 5.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  // Render cart items with enhanced styling
  if (state.cart.length === 0) {
    checkoutCartItems.innerHTML =
      '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
  } else {
    checkoutCartItems.innerHTML = state.cart
      .map(
        (item) => `
            <div class="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm mb-3">
                <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain border rounded-lg p-2">
                <div class="flex-1">
                    <p class="font-semibold text-base mb-1" title="${item.title}">
                        ${item.title.substring(0, 35)}${item.title.length > 35 ? "..." : ""}
                    </p>
                    <p class="text-gray-600 text-sm">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <span class="font-bold text-blue-600 text-lg">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `,
      )
      .join("");
  }

  // Update price breakdown
  const subtotalEl = document.getElementById("checkoutSubtotal");
  const shippingEl = document.getElementById("checkoutShipping");
  const taxEl = document.getElementById("checkoutTax");
  const totalEl = document.getElementById("checkoutTotal");

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = `$${shipping.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

  console.log("Checkout summary updated");
}

function toggleCreditCardFields() {
  console.log("Toggling credit card fields"); // Debug log

  const creditCardDetails = document.getElementById("creditCardDetails");
  const creditRadio = document.querySelector(
    'input[name="payment"][value="credit"]',
  );

  if (!creditCardDetails || !creditRadio) {
    console.log("Credit card elements not found");
    return;
  }

  if (creditRadio.checked) {
    creditCardDetails.classList.remove("hidden");
    // Make credit card fields required
    creditCardDetails.querySelectorAll("input").forEach((input) => {
      input.required = true;
    });
    console.log("Credit card fields shown");
  } else {
    creditCardDetails.classList.add("hidden");
    // Remove required from credit card fields
    creditCardDetails.querySelectorAll("input").forEach((input) => {
      input.required = false;
    });
    console.log("Credit card fields hidden");
  }
}

function placeOrder() {
  console.log("placeOrder called"); // Debug log

  const form = document.getElementById("checkoutForm");
  if (!form) {
    console.log("Checkout form not found");
    return;
  }

  // Validate form
  if (!form.checkValidity()) {
    console.log("Form validation failed");
    form.reportValidity();
    return;
  }

  // Show loading state
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (!placeOrderBtn) {
    console.log("Place order button not found");
    return;
  }

  const originalText = placeOrderBtn.innerHTML;
  placeOrderBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
  placeOrderBtn.disabled = true;

  // Collect form data for debugging
  const formData = new FormData(form);
  console.log("Order details:", Object.fromEntries(formData));

  // Simulate order processing
  setTimeout(() => {
    // Generate random order number
    const orderNumber = "SWIFT" + Math.floor(Math.random() * 1000000);
    const orderNumberEl = document.getElementById("orderNumber");
    if (orderNumberEl) {
      orderNumberEl.textContent = orderNumber;
    }

    // Set estimated delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const deliveryDateEl = document.getElementById("estimatedDelivery");
    if (deliveryDateEl) {
      deliveryDateEl.textContent = `Expected by ${deliveryDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )}`;
    }

    // Close checkout modal
    closeCheckout();

    // Clear cart
    state.cart = [];
    updateCartUI();
    saveCartToLocalStorage();

    // Show success modal
    openSuccessModal();

    // Reset button
    placeOrderBtn.innerHTML = originalText;
    placeOrderBtn.disabled = false;

    // Reset form
    form.reset();

    // Hide credit card fields
    const creditCardDetails = document.getElementById("creditCardDetails");
    if (creditCardDetails) {
      creditCardDetails.classList.add("hidden");
    }

    console.log("Order placed successfully");
  }, 2000);
}

// Success Modal Functions
function openSuccessModal() {
  console.log("Opening success modal"); // Debug log

  const successModal = document.getElementById("successModal");
  if (successModal) {
    successModal.classList.remove("hidden");
    successModal.classList.add("flex");
    document.body.style.overflow = "hidden";
  }
}

function closeSuccessModal() {
  console.log("Closing success modal"); // Debug log

  const successModal = document.getElementById("successModal");
  if (successModal) {
    successModal.classList.add("hidden");
    successModal.classList.remove("flex");
    document.body.style.overflow = "auto";
  }
}

// Make success modal functions globally accessible
window.closeSuccessModal = closeSuccessModal;
// ========== SUCCESS MODAL FUNCTIONS ==========
function openSuccessModal() {
  const successModal = document.getElementById("successModal");
  successModal.classList.remove("hidden");
  successModal.classList.add("flex");
  document.body.style.overflow = "hidden";
}

function closeSuccessModal() {
  const successModal = document.getElementById("successModal");
  successModal.classList.add("hidden");
  successModal.classList.remove("flex");
  document.body.style.overflow = "auto";
}

// ========== UPDATE CART SIDEBAR BUTTON ==========
function updateCartSidebarButton() {
  const checkoutBtn = document.querySelector("#cartSidebar button");
  if (checkoutBtn) {
    checkoutBtn.textContent = "Proceed to Checkout";
    checkoutBtn.removeEventListener("click", openCheckout);
    checkoutBtn.addEventListener("click", openCheckout);
  }
}

// ========== ADD CHECKOUT LISTENERS ==========
// ========== ADD CHECKOUT LISTENERS ==========
// ========== ADD CHECKOUT LISTENERS ==========
function addCheckoutListeners() {
  console.log("Setting up checkout listeners...");

  // Get the close button
  const closeBtn = document.getElementById("closeCheckout");

  if (closeBtn) {
    console.log("Close button found, attaching event listener");

    // Remove any existing listeners by cloning and replacing
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

    // Add fresh event listener
    newCloseBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      console.log("Close button clicked!");
      closeCheckout();
    });
  } else {
    console.log("Close button NOT found!");
  }

  // Close when clicking outside modal
  const checkoutModal = document.getElementById("checkoutModal");
  if (checkoutModal) {
    checkoutModal.addEventListener("click", function (event) {
      if (event.target === checkoutModal) {
        console.log("Clicked outside modal");
        closeCheckout();
      }
    });
  }

  // Payment method toggle
  document.querySelectorAll('input[name="payment"]').forEach((radio) => {
    radio.addEventListener("change", toggleCreditCardFields);
  });

  // Place order button
  const placeOrderBtn = document.getElementById("placeOrderBtn");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", placeOrder);
  }

  // Continue shopping button
  const continueBtn = document.getElementById("continueShoppingBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      closeSuccessModal();
    });
  }

  // Close success modal when clicking outside
  const successModal = document.getElementById("successModal");
  if (successModal) {
    successModal.addEventListener("click", function (event) {
      if (event.target === successModal) {
        closeSuccessModal();
      }
    });
  }
}

// ========== LOAD PRODUCTS BY CATEGORY ==========
async function loadProductsByCategory(category) {
  // Show loading spinner in products grid
  showProductsLoadingSpinner();

  let productsToShow = [];

  if (category === "all") {
    productsToShow = state.products;
  } else {
    // Check if we have cached products for this category
    if (!state.productsByCategory[category]) {
      try {
        const categoryProducts = await fetchData(
          `https://fakestoreapi.com/products/category/${category}`,
        );
        if (categoryProducts) {
          state.productsByCategory[category] = categoryProducts;
          productsToShow = categoryProducts;
        }
      } catch (error) {
        showToast("Failed to load category products", "error");
        productsToShow = [];
      }
    } else {
      productsToShow = state.productsByCategory[category];
    }
  }

  // Update the products grid
  document.getElementById("productsHeading").textContent =
    category === "all" ? "All Products" : `${category} Products`;
  document.getElementById("productsGrid").innerHTML =
    renderProducts(productsToShow);

  // Re-attach product listeners
  addProductListeners();
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = "success") {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast-notification");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast-notification fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-x-full ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } text-white`;
  toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} text-xl"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.classList.remove("translate-x-full");
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add("translate-x-full");
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
}
