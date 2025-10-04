const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Stripe product mapping
const stripeProducts = {
    'Style 1': { productId: 'prod_TALKJCrtITlN2W', priceId: 'price_1SE0dNRzY93579XlRSSAxRg2' },
    'Style 2': { productId: 'prod_TALKLPR10JASn2', priceId: 'price_1SE0dNRzY93579XlrcVsbu51' },
    'Style 3': { productId: 'prod_TALKaKWSHP3DpE', priceId: 'price_1SE0dORzY93579XlDPrXHenA' },
    'Style 4': { productId: 'prod_TALK2uxxnd3Fhv', priceId: 'price_1SE0dORzY93579Xl3CUtXQDG' },
    'Style 5': { productId: 'prod_TALKioQMZ5AGIM', priceId: 'price_1SE0dORzY93579Xl0RJf5Fij' },
    'Style 6': { productId: 'prod_TALKu8bqzPLbjn', priceId: 'price_1SE0dPRzY93579XlWU1iTKQS' }
};

// Create Stripe checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { cart_items, mode, success_url, cancel_url } = req.body;

        // Calculate subtotal
        const subtotal = cart_items.reduce((total, item) => total + (3000 * item.quantity), 0); // $30.00 per item in cents

        // Convert cart items to Stripe line items using actual product IDs
        const line_items = cart_items.map(item => {
            const stripeProduct = stripeProducts[item.style];
            if (!stripeProduct) {
                throw new Error(`Product not found for style: ${item.style}`);
            }
            
            return {
                price: stripeProduct.priceId,
                quantity: item.quantity,
            };
        });

        // Add shipping fee
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping Fee',
                    description: 'Standard shipping',
                },
                unit_amount: 500, // $5.00 in cents
            },
            quantity: 1,
        });

        // Add tax (10% of subtotal)
        const taxAmount = Math.round(subtotal * 0.10);
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Tax (10%)',
                    description: 'Sales tax',
                },
                unit_amount: taxAmount,
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: mode || 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            metadata: {
                source: 'islm-stack-website'
            }
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Success page
app.get('/success.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Successful - islm stack</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background: #0a0a0a;
                    color: #e0e0e0;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .success-container {
                    text-align: center;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                    padding: 3rem;
                    border-radius: 20px;
                    border: 2px solid #d4af37;
                    max-width: 500px;
                    width: 90%;
                }
                .success-icon {
                    font-size: 4rem;
                    color: #4CAF50;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #d4af37;
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                p {
                    color: #e0e0e0;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                .btn {
                    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                    color: #0a0a0a;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
                }
            </style>
        </head>
        <body>
            <div class="success-container">
                <div class="success-icon">✅</div>
                <h1>Payment Successful!</h1>
                <p>Thank you for your purchase. Your order has been confirmed and you will receive an email confirmation shortly.</p>
                <a href="/" class="btn">Continue Shopping</a>
            </div>
        </body>
        </html>
    `);
});

// Cancel page
app.get('/cancel.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Cancelled - islm stack</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    background: #0a0a0a;
                    color: #e0e0e0;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                }
                .cancel-container {
                    text-align: center;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
                    padding: 3rem;
                    border-radius: 20px;
                    border: 2px solid #ff4444;
                    max-width: 500px;
                    width: 90%;
                }
                .cancel-icon {
                    font-size: 4rem;
                    color: #ff4444;
                    margin-bottom: 1rem;
                }
                h1 {
                    color: #ff4444;
                    font-size: 2rem;
                    margin-bottom: 1rem;
                }
                p {
                    color: #e0e0e0;
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }
                .btn {
                    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                    color: #0a0a0a;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.3s ease;
                    margin-right: 1rem;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
                }
                .btn-secondary {
                    background: transparent;
                    color: #d4af37;
                    border: 2px solid #d4af37;
                }
                .btn-secondary:hover {
                    background: #d4af37;
                    color: #0a0a0a;
                }
            </style>
        </head>
        <body>
            <div class="cancel-container">
                <div class="cancel-icon">❌</div>
                <h1>Payment Cancelled</h1>
                <p>Your payment was cancelled. No charges have been made to your account.</p>
                <a href="/" class="btn">Continue Shopping</a>
                <a href="javascript:history.back()" class="btn btn-secondary">Try Again</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Stripe integration ready!');
});
