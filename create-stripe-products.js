const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createStripeProducts() {
    console.log('Creating Stripe products for Islamic Speaker styles...\n');

    const styles = [
        { number: 1, name: 'Style 1', description: 'Premium Islamic Speaker - Style 1' },
        { number: 2, name: 'Style 2', description: 'Premium Islamic Speaker - Style 2' },
        { number: 3, name: 'Style 3', description: 'Premium Islamic Speaker - Style 3' },
        { number: 4, name: 'Style 4', description: 'Premium Islamic Speaker - Style 4' },
        { number: 5, name: 'Style 5', description: 'Premium Islamic Speaker - Style 5' },
        { number: 6, name: 'Style 6', description: 'Premium Islamic Speaker - Style 6' }
    ];

    const products = [];

    for (const style of styles) {
        try {
            console.log(`Creating product for ${style.name}...`);
            
            // Create the product
            const product = await stripe.products.create({
                name: style.name,
                description: style.description,
                images: [`http://localhost:3000/${style.number}.jpg`], // You'll need to update this with your actual domain
                metadata: {
                    style_number: style.number.toString(),
                    category: 'islamic_speaker'
                }
            });

            // Create the price for this product
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: 3000, // $30.00 in cents
                currency: 'usd',
                metadata: {
                    style: style.name
                }
            });

            products.push({
                style: style.name,
                product_id: product.id,
                price_id: price.id,
                image_url: `http://localhost:3000/${style.number}.jpg`
            });

            console.log(`✅ Created ${style.name}:`);
            console.log(`   Product ID: ${product.id}`);
            console.log(`   Price ID: ${price.id}`);
            console.log(`   Image: ${style.number}.jpg\n`);

        } catch (error) {
            console.error(`❌ Error creating ${style.name}:`, error.message);
        }
    }

    console.log('\n🎉 Product creation complete!');
    console.log('\n📋 Summary:');
    products.forEach(p => {
        console.log(`${p.style}: ${p.product_id} (Price: ${p.price_id})`);
    });

    console.log('\n💡 Next steps:');
    console.log('1. Update your server.js to use these product/price IDs');
    console.log('2. Update image URLs to your actual domain');
    console.log('3. Test the checkout flow');

    return products;
}

// Run the script
createStripeProducts().catch(console.error);
