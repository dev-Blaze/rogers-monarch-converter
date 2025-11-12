
# Rogers to Monarch CSV Converter

A browser-based CSV conversion tool that transforms Rogers credit card transaction exports into Monarch Money compatible format. The app runs entirely in your browser - **your financial data never leaves your computer**.

## 🎯 Key Philosophy

**No Hardcoded Rules!** This app learns entirely from YOUR data. Upload a sample target file with your preferred categories and formatting, and the app will intelligently learn your patterns and apply them to all transactions.

## Features

✅ **100% Dynamic Learning**: No hardcoded category mappings - learns from your examples
✅ **Intelligent Matching**: Automatically matches transactions between files
✅ **Pattern Recognition**: Discovers category preferences, merchant formatting, and more
✅ **Drag & Drop**: Easy file upload with drag-and-drop support
✅ **Privacy First**: All processing happens in your browser
✅ **Live Preview**: See converted data before downloading
✅ **Conversion Stats**: View exactly how many patterns were learned

## How to Use

### Both Files Required

1. **Upload Rogers Bank CSV**: Your Rogers credit card transaction export (all transactions you want to convert)
2. **Upload Monarch Money Export CSV**: Your historical Monarch Money export with categorized transactions
3. The app will:
   - Learn merchant → category mappings from your Monarch export
   - Learn YOUR merchant name formatting preferences
   - Extract YOUR account naming convention
   - Apply these learned patterns to ALL Rogers transactions
4. **Download** the converted file ready for Monarch Money import

### Why Monarch Export is Required

The Monarch export file teaches the app YOUR specific preferences:
- How you categorize different merchants (e.g., "Starbucks" → "Coffee Shops")
- How you format merchant names (capitalization, abbreviations, etc.)
- Your custom categories (not limited to predefined lists)
- Your account naming conventions

The app learns patterns from your historical Monarch data and applies them to new Rogers transactions.

## What Gets Converted

### Rogers CSV Format (Input)
- Date, Posted Date, Reference Number, Activity Type, Activity Status, Card Number
- Merchant Category Description, Merchant Name, Merchant City, State, Country, Postal Code
- Amount, Rewards, Name on Card

### Monarch Money Format (Output)
- Date, Merchant, Category, Account, Original Statement, Notes, Amount, Tags, Owner

## Intelligent Learning

The app uses a smart learning algorithm:

1. **Pattern Extraction from Monarch**:
   - Extracts all merchant → category mappings from your historical data
   - Learns how you format merchant names
   - Identifies your most common account name
   - No transaction matching required - learns directly from your Monarch history

2. **Category Application**:
   - Exact merchant name match (highest priority)
   - Fuzzy/partial merchant name matching
   - Multiple occurrences = most common category wins
   - Consistent categorization based on your preferences

3. **Merchant Name Transformation**:
   - Learns and applies your preferred merchant name formatting
   - Preserves your capitalization style
   - Falls back to smart title-casing for unknown merchants

4. **Smart Application**:
   - Applies learned patterns to ALL Rogers transactions
   - Marks unrecognized merchants as "Uncategorized" for manual review

## Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build


### Tech Stack
- **React** - UI framework
- **Vite** - Build tool and dev server
- **PapaParse** - CSV parsing and generation
- **Pure JavaScript** - No server required


2. Build and deploy:
```bash
npm run build
# Deploy the 'dist' folder to GitHub Pages
```

## Privacy & Security

- ✅ All processing happens in the browser (client-side only)
- ✅ No data is uploaded to any server
- ✅ No tracking or analytics
- ✅ Open source - verify the code yourself

## File Structure

```
src/
├── App.jsx                          # Main app component
├── App.css                          # Styles
└── utils/
    ├── categoryMapping.js           # Utility functions (no hardcoded data)
    └── intelligentConverter.js      # Dynamic learning algorithm
```

## Tips for Best Results

1. **Rich Monarch Export**: Use a Monarch export with diverse merchants and categories
2. **More History = Better**: More historical data means more learned patterns
3. **Consistent Categories**: Your Monarch export should have consistent category names
4. **Review Output**: Check the preview and categorization rate before downloading
5. **Iterate**: Update categories in Monarch, re-export, and re-convert for better results

## Troubleshooting

**Low Categorization Rate?**
- Use a Monarch export with more diverse merchants
- Ensure your Monarch data includes the merchants you're trying to convert
- Check that merchant names are somewhat similar between Rogers and Monarch

**Wrong Categories?**
- Review your Monarch export - the app learns from your historical categorizations
- Update categories in Monarch Money, re-export, and try again
- The app picks the most common category if a merchant appears multiple times

**"Uncategorized" Items?**
- These are merchants not found in your Monarch export
- Manually categorize in Monarch Money after import
- Or: Add similar transactions to Monarch, export, and re-convert

## License

MIT License - Feel free to use and modify as needed.

---

Made with ❤️ using Github Copilot & Claude 4.5 Sonnet
