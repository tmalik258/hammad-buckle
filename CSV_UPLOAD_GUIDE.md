# CSV Product Upload Feature

## Overview
The CSV upload feature allows administrators to bulk upload products to the Wizza e-commerce platform using a CSV file format.

## How to Use

### 1. Access the Feature
- Navigate to the Admin Panel → Products
- Click the "Upload CSV" button next to "Add Product"

### 2. Download Template
- Click "Download Template" to get a sample CSV file with the correct format
- The template includes sample data and all required field headers

### 3. Prepare Your CSV File
- Use the downloaded template as a starting point
- Fill in your product data following the format
- Save as a .csv file

### 4. Upload Products
- Click "Select CSV File" and choose your prepared CSV file
- Click "Upload Products" to process the file
- Review the upload results and any error messages

## CSV Format

### Required Fields
- `name` - Product name (string, 3-100 characters)
- `price` - Product price (number, must be > 0)
- `categoryId` - Category ID (must exist in database)
- `typeId` - Type ID (must exist in database)
- `occasionId` - Occasion ID (must exist in database)
- `image` - Main product image URL (valid URL)

### Optional Fields
- `description` - Product description (string, max 1000 characters)
- `originalPrice` - Original price for sale items (number, must be >= price)
- `images` - Additional image URLs (comma-separated list)
- `stockQuantity` - Stock quantity (integer, default: 0)
- `inStock` - Whether product is in stock (boolean, default: true)
- `sku` - Product SKU (string, alphanumeric with hyphens/underscores)
- `weight` - Product weight in kg (number, max 10000)
- `dimensions` - Product dimensions (string, max 100 characters)
- `featured` - Whether product is featured (boolean, default: false)
- `isNew` - Whether product is new (boolean, default: false)
- `onSale` - Whether product is on sale (boolean, default: false)

### Validation Rules
- If `onSale` is true, `originalPrice` must be provided and greater than `price`
- `originalPrice` must be greater than or equal to `price`
- All URLs must be valid
- SKU can only contain letters, numbers, hyphens, and underscores
- Weight cannot be negative or exceed 10,000 kg

## Image URLs

### Supported Image Domains
The following image domains are pre-configured and will work without issues:
- `images.unsplash.com` - High-quality stock photos
- `picsum.photos` - Random placeholder images
- `via.placeholder.com` - Customizable placeholder images
- `trae-api-sg.mchost.guru` - Project's image generation API
- `example.com` - For testing purposes

### Recommended Image URLs
For best results, use these formats:
```
https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400
https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400
https://picsum.photos/400/400
https://via.placeholder.com/400x400
```

### Adding Custom Image Domains
If you need to use images from other domains, add them to `next.config.ts`:
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-domain.com',
      port: '',
      pathname: '/**',
    },
  ],
}
```

## Available Reference IDs

### Categories
- `cat-electronics` - Electronics
- `cat-fashion` - Fashion & Clothing
- `cat-home-garden` - Home & Garden
- `cat-sports-outdoors` - Sports & Outdoors
- `cat-books-media` - Books & Media

### Types
- `type-premium` - Premium
- `type-standard` - Standard
- `type-budget` - Budget
- `type-luxury` - Luxury
- `type-eco-friendly` - Eco-Friendly
- `type-smart` - Smart
- `type-professional` - Professional

### Occasions
- `occasion-everyday` - Everyday Use
- `occasion-work-office` - Work & Office
- `occasion-home-personal` - Home & Personal
- `occasion-special-events` - Special Events
- `occasion-fitness-sports` - Fitness & Sports
- `occasion-travel-outdoor` - Travel & Outdoor

## Example CSV Content

```csv
name,description,price,originalPrice,categoryId,typeId,occasionId,image,images,stockQuantity,inStock,sku,weight,dimensions,featured,isNew,onSale
"Sample Product","A sample product description",99.99,129.99,"cat-electronics","type-premium","occasion-everyday","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400,https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",100,true,"SKU-001",1.5,"10x10x5 cm",true,true,true
"Another Product","Another product description",49.99,,,"cat-fashion","type-standard","occasion-work-office","https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400","",50,true,"SKU-002",0.8,"15x10x3 cm",false,false,false
```

## Error Handling

The system provides detailed error reporting:
- **Row-level errors**: Shows which row and field caused the error
- **Validation errors**: Specific validation messages for each field
- **Reference errors**: When category, type, or occasion IDs don't exist
- **Success summary**: Total rows processed, successful uploads, and failures

## Best Practices

1. **Test with small batches**: Start with a few products to test the format
2. **Use the template**: Always start with the provided template
3. **Validate data**: Ensure all required fields are filled and valid
4. **Check references**: Verify that all category, type, and occasion IDs exist
5. **Review errors**: Carefully review any error messages and fix issues
6. **Backup data**: Consider backing up existing data before bulk uploads
7. **Use reliable image URLs**: Stick to the supported domains for images

## Troubleshooting

### Common Issues
1. **"Category not found"**: Check that the categoryId exists in the database
2. **"Invalid URL"**: Ensure image URLs are properly formatted
3. **"Price validation failed"**: Check that prices are valid numbers and follow rules
4. **"SKU format invalid"**: Use only letters, numbers, hyphens, and underscores
5. **"Image hostname not configured"**: Use images from supported domains or add the domain to next.config.ts

### Getting Help
- Check the error messages in the upload results
- Verify your CSV format matches the template
- Ensure all reference IDs exist in the system
- Use the recommended image URLs for testing
- Contact system administrator for technical issues

## Technical Details

- **File format**: CSV (Comma-Separated Values)
- **Encoding**: UTF-8
- **Max file size**: Limited by server configuration
- **Processing**: Row-by-row validation and creation
- **Database updates**: Category product counts are automatically updated
- **Transaction handling**: Each product is created in its own transaction
- **Image optimization**: Next.js automatically optimizes images from supported domains
