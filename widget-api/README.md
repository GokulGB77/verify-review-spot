# Widget API System

This folder contains the embeddable widget API system that allows entities to integrate review statistics and badges into their websites.

## Features

- **Review Statistics API**: Get total reviews, verified reviews, and average ratings
- **Embeddable Badges**: Customizable badges for websites
- **Cross-Origin Support**: Full CORS support for website integration

## API Endpoints

### GET /widget-api/stats/{entity_id}
Returns review statistics for an entity.

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

### GET /widget-api/badge/{entity_id}
Returns an SVG badge with review statistics.

**Query Parameters:**
- `style`: Badge style (default, compact, detailed)
- `color`: Primary color (hex without #)
- `background`: Background color (hex without #)

## Integration Examples

### Basic Statistics
```html
<script>
fetch('https://your-project.supabase.co/functions/v1/widget-api/stats/ENTITY_ID')
  .then(response => response.json())
  .then(data => {
    document.getElementById('reviews-count').textContent = data.total_reviews;
    document.getElementById('rating').textContent = data.average_rating;
  });
</script>
```

### Badge Embed
```html
<img src="https://your-project.supabase.co/functions/v1/widget-api/badge/ENTITY_ID?style=default&color=007bff" alt="Reviews Badge" />
```