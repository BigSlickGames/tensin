# Module Generator Guide

## Overview

The Module Generator is a utility tool that helps you create new modules for the Mini App Hub platform using the standard module template. It provides a user-friendly interface to generate properly structured module files.

## Features

- **Interactive Form**: Fill in module details through an easy-to-use form
- **Icon Picker**: Choose from a selection of emoji icons for your module
- **Type Selection**: Categorize your module as a game, tool, or utility
- **Code Generation**: Automatically generates a complete module file based on the template
- **Download**: Download the generated module as a .js file
- **Copy to Clipboard**: Copy the generated code directly to your clipboard

## How to Use

### 1. Access the Module Generator

- Open the Mini App Hub
- Navigate to the **Utilities** section
- Select **Module Generator** (🏗️ icon)

### 2. Fill in Module Details

**Module Name** (required)
- Enter a descriptive name for your module
- Example: "Math Quiz", "Timer Tool", "Color Picker"

**Icon** (required)
- Click on an emoji to select it as your module's icon
- Available icons include: 📦 🎮 🎯 🎲 🧩 🎨 🔧 ⚙️ 📊 🚀 💡 🎪

**Type** (required)
- Select the category for your module:
  - **Game**: Interactive games and entertainment
  - **Tool**: Utility tools and helpers
  - **Utility**: System utilities and platform features

**Description** (optional)
- Provide a brief description of what your module does
- This appears in the module list to help users understand its purpose

### 3. Generate the Module

1. Click the **Generate Module** button
2. Review the generated module preview
3. Choose one of the following actions:
   - **Download Module**: Downloads the .js file to your device
   - **Copy Code**: Copies the code to your clipboard

### 4. Install the Module

1. Place the generated file in the `/public/modules/` directory
2. Add the script to the module loader in `/public/app/app.js`:
   ```javascript
   const moduleScripts = [
     // ... existing modules
     '/modules/your-module-name.js'
   ];
   ```
3. Refresh the application to see your new module

## Generated Module Structure

The generator creates a complete module with:

- **State Management**: Built-in state tracking
- **Element Caching**: Efficient DOM element references
- **Event Handlers**: Pre-configured button interactions
- **Cleanup Function**: Proper cleanup when module is unloaded
- **Module Registration**: Automatic registration with the platform
- **Telegram Integration**: Haptic feedback support
- **Responsive UI**: Mobile-friendly interface using platform styles

## Customizing Your Module

After generating the module, you can customize:

1. **Layout**: Modify the HTML structure in the `render()` function
2. **Functionality**: Add your custom logic to `startModule()` and `stopModule()`
3. **State**: Add custom properties to the `state` object
4. **Events**: Add more event listeners in `attachEventListeners()`
5. **Styling**: Add custom styles via `<style>` tags if needed

## Example Workflow

```javascript
// 1. Generate module with these settings:
Module Name: "Coin Flip"
Icon: 🎲
Type: game
Description: "Simple coin flip game"

// 2. Download the generated file: coin-flip.js

// 3. Place in /public/modules/coin-flip.js

// 4. Add to app.js:
'/modules/coin-flip.js'

// 5. Customize the generated code to add coin flip logic
```

## API Reference

### ModuleGenerator Class

Available as `window.ModuleGenerator`

#### Methods

**generateModuleCode(options)**
- Generates the module code string
- Parameters:
  - `name` (string, required): Module name
  - `icon` (string): Emoji icon (default: '📦')
  - `type` (string): Module type - 'game', 'tool', or 'utility' (default: 'tool')
  - `description` (string): Module description (default: '')
  - `id` (string): Custom module ID (auto-generated if not provided)
- Returns: String containing the module code

**downloadModule(options)**
- Generates and downloads the module file
- Parameters: Same as `generateModuleCode`
- Returns: Object with `filename`, `code`, and `moduleId`

**copyToClipboard(options)**
- Generates and copies code to clipboard
- Parameters: Same as `generateModuleCode`
- Returns: Promise<boolean>

**validateOptions(options)**
- Validates module configuration
- Parameters: Same as `generateModuleCode`
- Returns: Object with `valid` (boolean) and `errors` (array)

**generateId(name)**
- Generates a kebab-case ID from a module name
- Parameters: `name` (string)
- Returns: String in kebab-case format

**getModuleInfo(options)**
- Gets metadata about the module
- Parameters: Same as `generateModuleCode`
- Returns: Object with module metadata

## Tips

1. **Naming**: Use clear, descriptive names that explain what your module does
2. **Icons**: Choose icons that visually represent your module's purpose
3. **Type**: Select the correct type to help users find your module
4. **Description**: Write concise but informative descriptions
5. **Testing**: Test your generated module before deploying to production

## Programmatic Usage

You can also use the ModuleGenerator programmatically:

```javascript
// Generate code
const code = window.ModuleGenerator.generateModuleCode({
  name: 'My Custom Module',
  icon: '🚀',
  type: 'tool',
  description: 'Does something awesome'
});

// Validate before generating
const validation = window.ModuleGenerator.validateOptions({
  name: 'Test Module'
});

if (validation.valid) {
  // Generate module
  window.ModuleGenerator.downloadModule({
    name: 'Test Module',
    icon: '🔧',
    type: 'utility'
  });
}
```

## Best Practices

1. **Follow the Template**: The generated code follows platform standards - maintain this structure
2. **Implement Cleanup**: Always clean up resources in the `cleanup()` function
3. **Use Data Attributes**: Keep `data-element` attributes for maintainability
4. **Respect Container**: Never modify elements outside the provided container
5. **Platform Integration**: Use `window.TelegramAdapter` for platform features
6. **Style Consistency**: Use CSS classes from master.css

## Troubleshooting

**Module doesn't appear**
- Check that the file is in `/public/modules/`
- Verify it's added to the module loader in app.js
- Check browser console for errors

**Icon not displaying**
- Ensure you're using a valid emoji character
- Some emojis may not display on all devices

**Validation errors**
- Module name is required and cannot be empty
- Type must be 'game', 'tool', or 'utility'
- Custom IDs must be lowercase with hyphens only

## Support

For questions or issues with the Module Generator:
1. Check the module template documentation
2. Review existing modules in `/public/modules/`
3. Consult the platform architecture documentation
