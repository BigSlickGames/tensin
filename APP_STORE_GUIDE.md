# App Store Guide

## Overview

The App Store provides a beautiful, iOS-style interface for browsing and discovering apps in the Mini App Hub. It features a curated experience with featured apps, popular apps based on usage, and newly added apps.

## Features

### 1. Featured Apps
- Hand-picked apps displayed in a horizontal carousel
- Beautiful featured cards with gradient backgrounds and "Featured" badge
- Shows app icon, name, description, type, and launch count
- Tap any card to launch the app

### 2. Popular Apps
- Grid of apps sorted by launch count
- Shows most-used apps across the platform
- Updates dynamically as users interact with apps
- Displays launch count for each app

### 3. New & Updated
- Recently added apps displayed in a grid
- Apps added within the last 7 days show a "NEW" badge
- Sorted by creation date (newest first)

### 4. App Cards
- Clean, modern design with app icon
- App name, type, and launch statistics
- Quick launch button on each card
- Responsive grid layout

## Database Schema

The app store uses a Supabase table to track module metadata:

```sql
module_metadata
- id (text, primary key) - module ID
- name (text) - module name
- icon (text) - emoji icon
- type (text) - module type (game, tool, utility)
- description (text) - module description
- is_featured (boolean) - whether module is featured
- launch_count (integer) - total launches
- created_at (timestamptz) - when module was added
- updated_at (timestamptz) - last update time
```

## Architecture

### Components

**AppStoreManager** (`/app/appStoreManager.js`)
- Manages module metadata and database synchronization
- Tracks launch counts and featured status
- Provides filtering and sorting methods
- Auto-syncs modules on initialization

**App Store Module** (`/modules/appStore.js`)
- UI component for the store interface
- Displays featured, popular, and new sections
- Handles app launching and analytics
- Responsive design with smooth animations

## Usage

### Accessing the App Store

1. Open the Mini App Hub
2. Navigate to the Utilities section
3. Select "App Store"

### Launching Apps

Click on any app card or featured card to launch the app. Launch counts are automatically tracked.

### Making an App Featured

Use the AppStoreManager API:

```javascript
await window.AppStoreManager.setFeatured('module-id', true);
```

To unfeatured an app:

```javascript
await window.AppStoreManager.setFeatured('module-id', false);
```

## API Reference

### AppStoreManager

**initialize()**
- Initializes the manager and syncs with database
- Called automatically on app startup

**syncModules()**
- Syncs all registered modules to database
- Creates entries for new modules
- Updates metadata cache

**getFeaturedModules()**
- Returns array of featured modules
- Modules enriched with metadata
- Returns: `Array<Module>`

**getPopularModules(limit = 6)**
- Returns most-launched modules
- Parameters:
  - `limit` (number): Maximum number to return
- Returns: `Array<Module>`

**getNewModules(limit = 6)**
- Returns recently added modules
- Sorted by creation date (newest first)
- Parameters:
  - `limit` (number): Maximum number to return
- Returns: `Array<Module>`

**incrementLaunchCount(moduleId)**
- Increments launch count for a module
- Updates both database and local cache
- Parameters:
  - `moduleId` (string): ID of the module

**setFeatured(moduleId, isFeatured)**
- Sets featured status for a module
- Parameters:
  - `moduleId` (string): ID of the module
  - `isFeatured` (boolean): Featured status

**getMetadata(moduleId)**
- Gets metadata for a specific module
- Parameters:
  - `moduleId` (string): ID of the module
- Returns: `Object` or `undefined`

**enrichModule(module)**
- Adds metadata to a module object
- Parameters:
  - `module` (Object): Base module object
- Returns: `Object` with metadata property

**getAllEnriched()**
- Returns all modules with metadata
- Returns: `Array<Module>`

**getModuleAge(moduleId)**
- Gets human-readable age of a module
- Parameters:
  - `moduleId` (string): ID of the module
- Returns: String like "New today", "3 days ago", etc.

## Automatic Features

### Default Featured Apps

On first initialization, the following apps are automatically featured:
- Tap Game
- Memory Game
- Bubble Pop

These can be changed by modifying the `setDefaultFeatured()` method.

### Launch Tracking

Every time a user launches an app through the App Store, the launch count is automatically incremented. This data powers the "Popular" section.

### Module Synchronization

When the app initializes:
1. All registered modules are synced to the database
2. New modules are automatically added
3. Existing modules are left unchanged
4. Metadata is loaded into memory for fast access

## Styling

The App Store uses a premium, iOS-inspired design:

- **Featured Section**: Horizontal scrolling carousel with gradient cards
- **Grid Sections**: Responsive grid (2-3 columns depending on screen size)
- **Color Scheme**: Blue gradient hero, dark cards with borders
- **Animations**: Smooth scale transitions on tap
- **Typography**: Bold headings, clear hierarchy
- **Badges**: Featured badge (gold), New badge (green)

## Performance Considerations

- Metadata is cached in memory after initial load
- Launch count updates are non-blocking
- Featured status queries use database indexes
- Efficient filtering and sorting algorithms

## Future Enhancements

Potential improvements:
- Search functionality
- Category filtering
- User ratings and reviews
- Screenshots/preview images
- App details page
- Update notifications
- Personalized recommendations
- Download/install tracking

## Security

- Row Level Security (RLS) enabled on database table
- Anyone can read metadata (public information)
- Only service role can modify metadata
- Launch counts protected from direct manipulation

## Troubleshooting

**No apps showing in store**
- Check that modules are properly registered
- Verify Supabase connection
- Check browser console for errors

**Featured apps not appearing**
- Verify `is_featured` is set to `true` in database
- Check that module IDs match exactly
- Refresh metadata cache

**Launch counts not updating**
- Check Supabase connection
- Verify RLS policies are correct
- Check for database errors in console

## Integration Example

```javascript
// Initialize on app startup (done automatically)
await window.AppStoreManager.initialize();

// Launch an app and track it
async function launchApp(moduleId) {
  await window.AppStoreManager.incrementLaunchCount(moduleId);
  window.UIManager.launchModule(moduleId);
}

// Get popular apps
const popular = window.AppStoreManager.getPopularModules(10);
console.log('Top 10 apps:', popular);

// Feature an app
await window.AppStoreManager.setFeatured('my-new-game', true);
```
