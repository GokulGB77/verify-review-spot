# Widget API Documentation

## Overview

The Widget API provides embeddable review statistics and badges that entities can integrate into their websites. The API is designed for public access with full CORS support.

## Base URL

```
https://your-project.supabase.co/functions/v1/widget-api
```

## Endpoints

### GET /stats/{entity_id}

Retrieves review statistics for a specific entity.

**Parameters:**
- `entity_id` (path parameter): The unique identifier of the entity

**Response:**
```json
{
  "entity_id": "string",
  "entity_name": "string",
  "total_reviews": number,
  "verified_reviews": number,
  "average_rating": number,
  "total_stars": number
}
```

**Example:**
```javascript
fetch('https://your-project.supabase.co/functions/v1/widget-api/stats/123e4567-e89b-12d3-a456-426614174000')
  .then(response => response.json())
  .then(data => console.log(data));
```

### GET /badge/{entity_id}

Generates an SVG badge displaying review statistics.

**Parameters:**
- `entity_id` (path parameter): The unique identifier of the entity
- `style` (query parameter, optional): Badge style - `default`, `compact`, `detailed`
- `color` (query parameter, optional): Primary color as hex without # (default: `007bff`)
- `background` (query parameter, optional): Background color as hex without # (default: `ffffff`)

**Response:**
SVG image with Content-Type: `image/svg+xml`

**Examples:**
```html
<!-- Default badge -->
<img src="https://your-project.supabase.co/functions/v1/widget-api/badge/123e4567-e89b-12d3-a456-426614174000" alt="Reviews Badge" />

<!-- Compact green badge -->
<img src="https://your-project.supabase.co/functions/v1/widget-api/badge/123e4567-e89b-12d3-a456-426614174000?style=compact&color=28a745" alt="Reviews Badge" />

<!-- Detailed blue badge -->
<img src="https://your-project.supabase.co/functions/v1/widget-api/badge/123e4567-e89b-12d3-a456-426614174000?style=detailed&color=007bff&background=f8f9fa" alt="Reviews Badge" />
```

## Badge Styles

### Default
- Size: 160x50px
- Contains: Entity name, star rating, review count
- Best for: General website integration

### Compact  
- Size: 120x40px
- Contains: Shortened entity name, star rating, review count
- Best for: Sidebars, tight spaces

### Detailed
- Size: 200x80px
- Contains: Entity name, star rating, total reviews, verified count
- Best for: Prominent placement, detailed information

## Error Handling

All endpoints return JSON error responses with appropriate HTTP status codes:

```json
{
  "error": "Error description"
}
```

Common errors:
- `400`: Invalid entity ID or parameters
- `404`: Entity not found
- `500`: Internal server error

## CORS Support

The API includes full CORS support with the following headers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- `Access-Control-Allow-Methods: GET, OPTIONS`

## Caching

Badge responses include cache headers:
- `Cache-Control: public, max-age=300` (5 minutes)

Statistics responses are not cached to ensure real-time data.

## Rate Limiting

Currently no rate limiting is implemented, but it's recommended to cache responses on the client side when possible.

## Security

- The API is public and does not require authentication
- Only active entities are returned
- No sensitive data is exposed in responses

## Integration Best Practices

1. **Error Handling**: Always implement proper error handling for network requests
2. **Loading States**: Show loading indicators while fetching data
3. **Fallbacks**: Provide fallback content if the API is unavailable
4. **Caching**: Cache responses appropriately to reduce API calls
5. **Responsive Design**: Ensure badges work well on different screen sizes

## Example Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Review Widget Example</title>
</head>
<body>
    <div id="review-widget">
        <div id="loading">Loading reviews...</div>
    </div>

    <script>
        const entityId = 'your-entity-id-here';
        const apiBase = 'https://your-project.supabase.co/functions/v1/widget-api';
        
        async function loadReviewWidget() {
            try {
                const response = await fetch(`${apiBase}/stats/${entityId}`);
                const data = await response.json();
                
                document.getElementById('review-widget').innerHTML = `
                    <div style="border: 1px solid #ddd; padding: 15px; border-radius: 8px;">
                        <h3>${data.entity_name}</h3>
                        <p>⭐ ${data.average_rating}/5 (${data.total_reviews} reviews)</p>
                        <p>✓ ${data.verified_reviews} verified</p>
                        <img src="${apiBase}/badge/${entityId}?style=compact" alt="Badge" />
                    </div>
                `;
            } catch (error) {
                document.getElementById('review-widget').innerHTML = 
                    '<p>Unable to load reviews at this time.</p>';
            }
        }
        
        loadReviewWidget();
    </script>
</body>
</html>
```