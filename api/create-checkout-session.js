const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== STRIPE CHECKOUT DEBUG ===');
    console.log('API Key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('API Key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { cart_items } = req.body;

    if (!cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Simple product mapping - just use one price for all styles
    const line_items = cart_items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Quran Magnet Speaker - ${item.style}`,
          description: 'Premium Islamic Speaker for Quran Recitation',
          images: [`https://islamstack.vercel.app/${item.style.split(' ')[1]}.jpg`],
        },
        unit_amount: 3000, // $30.00 in cents
      },
      quantity: item.quantity,
    }));

    console.log('Line items created:', JSON.stringify(line_items, null, 2));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://islamstack.vercel.app/success.html',
      cancel_url: 'https://islamstack.vercel.app/cancel.html',
      metadata: {
        source: 'islamstack-website'
      }
    });

    console.log('Stripe session created successfully:', session.id);
    res.status(200).json({ id: session.id });

  } catch (error) {
    console.error('=== STRIPE ERROR ===');
    console.error('Error type:', error.type);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}
