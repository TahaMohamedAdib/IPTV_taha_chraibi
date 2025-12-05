# Shopify Payment Integration Guide

## Overview
This guide will help you integrate Shopify's payment system with your Prime IPTV checkout page.

## Method 1: Shopify Buy Button (Easiest)

### Step 1: Create Products in Shopify
1. Log in to your Shopify admin panel
2. Go to **Products** → **Add product**
3. Create products for each plan:
   - **Essential Plan - 1 Month - 1 Device** ($16)
   - **Essential Plan - 3 Months - 1 Device** ($30)
   - **VIP Elite Plan - 1 Month - 1 Device** ($25)
   - **VIP Elite Plan - 3 Months - 2 Devices** ($65)
   - (Create all combinations as needed)

### Step 2: Generate Buy Button
1. In Shopify admin, go to **Sales channels** → **Online Store** → **Themes**
2. Click **Customize** → **Add section** → **Buy Button**
3. Select your product
4. Click **Generate code**
5. Copy the embed code

### Step 3: Add to checkout.html
1. Open `checkout.html`
2. Find the section with `id="shopify-buy-button"`
3. Replace the placeholder content with your Shopify Buy Button code:

```html
<div id="shopify-buy-button">
    <!-- PASTE YOUR SHOPIFY BUY BUTTON CODE HERE -->
    <script>
        // Shopify Buy Button code will go here
    </script>
</div>
```

## Method 2: Shopify Checkout API (Advanced)

### Step 1: Get Shopify API Credentials
1. In Shopify admin, go to **Apps** → **Develop apps**
2. Create a new app
3. Enable **Storefront API**
4. Get your **Storefront Access Token**

### Step 2: Update checkout.html JavaScript
Replace the form submission code with:

```javascript
document.getElementById('checkoutForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const order = getOrderDetails();
    const formData = {
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        // ... other fields
    };

    // Create Shopify checkout
    const checkoutUrl = await createShopifyCheckout(order, formData);
    window.location.href = checkoutUrl;
});

async function createShopifyCheckout(order, customerInfo) {
    const SHOPIFY_DOMAIN = 'your-store.myshopify.com';
    const STOREFRONT_TOKEN = 'your-storefront-access-token';
    
    const query = `
        mutation checkoutCreate($input: CheckoutCreateInput!) {
            checkoutCreate(input: $input) {
                checkout {
                    id
                    webUrl
                }
            }
        }
    `;
    
    const variables = {
        input: {
            email: customerInfo.email,
            lineItems: [
                {
                    variantId: 'gid://shopify/ProductVariant/YOUR_VARIANT_ID',
                    quantity: 1
                }
            ]
        }
    };
    
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables })
    });
    
    const data = await response.json();
    return data.data.checkoutCreate.checkout.webUrl;
}
```

## Method 3: Direct Shopify Store Link (Simplest)

### Option A: Link to Product Pages
Update the `orderPlan` function in `pricing.html`:

```javascript
function orderPlan(planType) {
    const card = document.querySelector(`.pricing-card-new[data-plan="${planType}"]`);
    
    if (card) {
        const selectedTime = card.querySelector('.time-dropdown').value;
        const selectedDevices = card.querySelector('.device-dropdown').value;
        
        // Map to Shopify product URLs
        const shopifyProducts = {
            'essential-1-1': 'https://your-store.myshopify.com/products/essential-1month-1device',
            'essential-3-2': 'https://your-store.myshopify.com/products/essential-3months-2devices',
            'vip-1-1': 'https://your-store.myshopify.com/products/vip-1month-1device',
            'vip-3-2': 'https://your-store.myshopify.com/products/vip-3months-2devices',
            // Add all combinations
        };
        
        const productKey = `${planType}-${selectedTime}-${selectedDevices}`;
        const shopifyUrl = shopifyProducts[productKey];
        
        if (shopifyUrl) {
            window.location.href = shopifyUrl;
        }
    }
}
```

## Method 4: Shopify Embedded Checkout

### Step 1: Install Shopify App
1. Create a Shopify app in your Partner account
2. Enable **Checkout UI Extensions**
3. Install the app on your store

### Step 2: Embed Checkout
Add this to your `checkout.html`:

```html
<script src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/checkout.js"></script>
<div id="shopify-checkout-container"></div>

<script>
    const checkout = ShopifyCheckout.init({
        storefrontAccessToken: 'YOUR_TOKEN',
        domain: 'your-store.myshopify.com'
    });
    
    checkout.render('#shopify-checkout-container');
</script>
```

## Recommended Setup for Your Site

I recommend **Method 1 (Buy Button)** for the easiest setup:

1. Create 20-30 products in Shopify (all plan combinations)
2. Generate Buy Buttons for each
3. Use JavaScript to dynamically load the correct Buy Button based on user selection

### Dynamic Buy Button Loading

Add this to `checkout.html`:

```javascript
function loadShopifyButton(plan, duration, devices) {
    const buttonContainer = document.getElementById('shopify-buy-button');
    
    // Map of product IDs
    const productIds = {
        'essential-1-1': '1234567890',
        'essential-3-2': '2345678901',
        'vip-1-1': '3456789012',
        'vip-3-2': '4567890123',
        // Add all your product IDs
    };
    
    const productKey = `${plan}-${duration}-${devices}`;
    const productId = productIds[productKey];
    
    if (productId) {
        // Load Shopify Buy Button script dynamically
        buttonContainer.innerHTML = `
            <div id='product-component-${productId}'></div>
            <script type="text/javascript">
                ShopifyBuy.UI.onReady(client).then(function (ui) {
                    ui.createComponent('product', {
                        id: '${productId}',
                        node: document.getElementById('product-component-${productId}'),
                        options: { /* your options */ }
                    });
                });
            </script>
        `;
    }
}

// Call on page load
const order = getOrderDetails();
loadShopifyButton(order.plan, order.duration, order.devices);
```

## Testing

1. Use Shopify's test mode
2. Test with Shopify's test credit cards:
   - **Success**: 4242 4242 4242 4242
   - **Decline**: 4000 0000 0000 0002

## Support

For more help:
- Shopify Documentation: https://shopify.dev/docs
- Shopify Buy Button: https://help.shopify.com/en/manual/online-sales-channels/buy-button
- Storefront API: https://shopify.dev/api/storefront

## Alternative Payment Processors

If you prefer not to use Shopify, you can also integrate:
- **Stripe**: https://stripe.com/docs/payments/checkout
- **PayPal**: https://developer.paypal.com/docs/checkout/
- **Square**: https://developer.squareup.com/docs/checkout-api/what-it-does
