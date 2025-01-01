# Project Name

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- shadcn-ui
- Tailwind CSS
- Supabase

## How can I deploy this project with a custom domain?

To use a custom domain like portal.tasking.tech with Netlify, follow these steps:

1. Deploy your project to Netlify:
   - Connect your GitHub repository to Netlify
   - Configure the build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

2. Add your custom domain in Netlify:
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., portal.tasking.tech)
   - Follow Netlify's DNS configuration instructions

3. Configure your DNS records:
   - Add a CNAME record pointing to your Netlify site URL
   - Or use Netlify DNS for complete management
   - Wait for DNS propagation (can take up to 48 hours)

For detailed instructions, visit the Netlify documentation on [Custom Domains](https://docs.netlify.com/domains-https/custom-domains/).

## Alternative deployment options

You can also use the default Netlify URL without a custom domain:
1. Connect your repository to [Netlify](https://app.netlify.com)
2. Configure your build settings
3. Use the provided Netlify URL for your application