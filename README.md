# islmstack - Quran Magnet Speaker E-commerce Site

A modern, responsive e-commerce website for selling Islamic speakers with Stripe payment integration.

## Features

- 🎯 Single product focus (Quran Magnet Speaker)
- 📱 Fully responsive design (mobile-first)
- 🛒 Shopping cart functionality
- 💳 Stripe payment integration
- 🎨 Dark theme with gold accents
- 📖 Beautiful Quran verse in header
- 🖼️ Product image gallery with 6 different styles

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/MousScales/islamstack.git
cd islamstack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory with your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
PORT=3000
```

### 4. Update Stripe Keys in Frontend
Update the Stripe publishable key in `index.html`:
```javascript
const stripe = Stripe('pk_live_your_stripe_publishable_key_here');
```

### 5. Create Stripe Products (Optional)
Run the script to create products in your Stripe dashboard:
```bash
node create-stripe-products.js
```

### 6. Start the Server (Local Development)
```bash
npm start
```

The site will be available at `http://localhost:3000`

## Vercel Deployment

### 1. Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a Node.js project
3. Add environment variables in Vercel dashboard:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### 2. Update Frontend for Production
After deployment, update the Stripe publishable key in `index.html` with your live key:
```javascript
const stripe = Stripe('pk_live_your_live_stripe_publishable_key_here');
```

### 3. Vercel Configuration
The project includes:
- `vercel.json` - Vercel configuration
- `api/create-checkout-session.js` - Serverless function for Stripe
- `success.html` and `cancel.html` - Payment result pages

## File Structure

```
islamstack/
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── server.js               # Express server with Stripe integration
├── package.json            # Node.js dependencies
├── create-stripe-products.js # Script to create Stripe products
├── *.jpg                   # Product images (1.jpg - 6.jpg)
└── README.md              # This file
```

## Product Images

The site uses 6 product images (1.jpg through 6.jpg) representing different styles of the Quran Magnet Speaker. Make sure these images are present in the root directory.

## Stripe Integration

- Uses Stripe Checkout for secure payments
- Supports all major payment methods
- Automatic product creation for each style
- Success and cancel page handling

## Mobile Responsive

- Optimized for all screen sizes
- Touch-friendly interface
- Responsive image gallery
- Mobile-optimized cart modal

## Technologies Used

- HTML5 & CSS3
- JavaScript (ES6+)
- Node.js & Express
- Stripe API
- Font Awesome icons
- Google Fonts (Inter)

## License

This project is for educational/commercial use. Please ensure you have proper licenses for all images and comply with Stripe's terms of service.
