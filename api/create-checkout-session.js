const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe product mapping
const stripeProducts = {
    'Style 1': { productId: 'prod_TALKJCrtITlN2W', priceId: 'price_1SE0dNRzY93579XlRSSAxRg2' },
    'Style 2': { productId: 'prod_TALKLPR10JASn2', priceId: 'price_1SE0dNRzY93579XlrcVsbu51' },
    'Style 3': { productId: 'prod_TALKaKWSHP3DpE', priceId: 'price_1SE0dORzY93579XlDPrXHenA' },
    'Style 4': { productId: 'prod_TALK2uxxnd3Fhv', priceId: 'price_1SE0dORzY93579Xl3CUtXQDG' },
    'Style 5': { productId: 'prod_TALKioQMZ5AGIM', priceId: 'price_1SE0dORzY93579Xl0RJf5Fij' },
    'Style 6': { productId: 'prod_TALKu8bqzPLbjn', priceId: 'price_1SE0dPRzY93579XlWU1iTKQS' }
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Request body:', req.body);
        const { cart_items, mode, success_url, cancel_url } = req.body;

        if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
            console.error('Invalid cart_items:', cart_items);
            return res.status(400).json({ error: 'Invalid cart items' });
        }

        console.log('Processing cart items:', cart_items);

        // Convert cart items to Stripe line items using actual product IDs
        const line_items = cart_items.map(item => {
            console.log('Processing item:', item);
            const stripeProduct = stripeProducts[item.style];
            if (!stripeProduct) {
                console.error(`Product not found for style: ${item.style}`);
                throw new Error(`Product not found for style: ${item.style}`);
            }
            
            return {
                price: stripeProduct.priceId,
                quantity: item.quantity,
            };
        });

        console.log('Line items:', line_items);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: mode || 'payment',
            success_url: success_url || `https://islamstack.vercel.app/success.html`,
            cancel_url: cancel_url || `https://islamstack.vercel.app/cancel.html`,
            metadata: {
                source: 'islamstack-website'
            }
        });

        console.log('Stripe session created:', session.id);
        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
}
