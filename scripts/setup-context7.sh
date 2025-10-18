#!/bin/bash

# Context7 MCP API Key Configuration Script
# This script helps you configure the Context7 MCP server API key

set -e

echo "=========================================="
echo "  Context7 MCP API Key Configuration"
echo "=========================================="
echo ""

# Check if API key is provided as argument
if [ -n "$1" ]; then
    API_KEY="$1"
else
    # Prompt for API key
    echo "Enter your Context7 API key (starts with ctx7sk_):"
    read -r API_KEY
fi

# Validate API key format
if [[ ! $API_KEY =~ ^ctx7sk_ ]]; then
    echo "❌ Error: API key must start with 'ctx7sk_'"
    echo "Get your API key from: https://context7.com"
    exit 1
fi

echo ""
echo "Choose configuration method:"
echo "1) VS Code User Settings (Recommended - keeps key separate from project)"
echo "2) Add to .env file (Simple - for local development only)"
echo "3) Show manual instructions"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        # VS Code User Settings
        VSCODE_SETTINGS="$HOME/.config/Code/User/settings.json"
        
        if [ ! -f "$VSCODE_SETTINGS" ]; then
            echo "❌ VS Code settings file not found at: $VSCODE_SETTINGS"
            echo "Please open VS Code and try again."
            exit 1
        fi
        
        echo ""
        echo "⚠️  This will modify your VS Code User Settings."
        read -p "Continue? (y/n): " confirm
        
        if [ "$confirm" != "y" ]; then
            echo "Cancelled."
            exit 0
        fi
        
        # Backup existing settings
        cp "$VSCODE_SETTINGS" "$VSCODE_SETTINGS.backup"
        echo "✓ Backed up settings to: $VSCODE_SETTINGS.backup"
        
        # Check if mcp.servers already exists
        if grep -q '"mcp.servers"' "$VSCODE_SETTINGS"; then
            echo ""
            echo "⚠️  'mcp.servers' configuration already exists in settings."
            echo "Please manually add the Context7 configuration:"
            echo ""
            echo '    "upstash_conte": {'
            echo '      "env": {'
            echo "        \"CONTEXT7_API_KEY\": \"$API_KEY\""
            echo '      }'
            echo '    }'
            echo ""
        else
            # Add MCP configuration
            # Remove trailing } and add our config
            sed -i '$ d' "$VSCODE_SETTINGS"
            cat >> "$VSCODE_SETTINGS" << EOF
,
  "mcp.servers": {
    "upstash_conte": {
      "env": {
        "CONTEXT7_API_KEY": "$API_KEY"
      }
    }
  }
}
EOF
            echo "✓ Added Context7 MCP configuration to VS Code settings"
        fi
        
        echo ""
        echo "✓ Configuration complete!"
        echo "Please restart VS Code for changes to take effect."
        ;;
        
    2)
        # Add to .env file
        ENV_FILE=".env"
        
        if [ ! -f "$ENV_FILE" ]; then
            echo "Creating .env file from .env.example..."
            cp .env.example .env
        fi
        
        # Check if CONTEXT7_API_KEY already exists
        if grep -q "CONTEXT7_API_KEY=" "$ENV_FILE"; then
            # Update existing key
            sed -i "s|CONTEXT7_API_KEY=.*|CONTEXT7_API_KEY=$API_KEY|" "$ENV_FILE"
            echo "✓ Updated CONTEXT7_API_KEY in .env"
        else
            # Add new key
            echo "" >> "$ENV_FILE"
            echo "# Context7 MCP Server" >> "$ENV_FILE"
            echo "CONTEXT7_API_KEY=$API_KEY" >> "$ENV_FILE"
            echo "✓ Added CONTEXT7_API_KEY to .env"
        fi
        
        echo ""
        echo "✓ Configuration complete!"
        echo "Note: You still need to configure VS Code to use this environment variable."
        echo "See docs/CONTEXT7_SETUP.md for instructions."
        ;;
        
    3)
        # Show manual instructions
        echo ""
        echo "=========================================="
        echo "  Manual Configuration Instructions"
        echo "=========================================="
        echo ""
        echo "1. Open VS Code Command Palette (Ctrl+Shift+P or Cmd+Shift+P)"
        echo "2. Type: Preferences: Open User Settings (JSON)"
        echo "3. Add this configuration:"
        echo ""
        echo '{'
        echo '  "mcp.servers": {'
        echo '    "upstash_conte": {'
        echo '      "env": {'
        echo "        \"CONTEXT7_API_KEY\": \"$API_KEY\""
        echo '      }'
        echo '    }'
        echo '  }'
        echo '}'
        echo ""
        echo "4. Save and restart VS Code"
        echo ""
        echo "For more details, see: docs/CONTEXT7_SETUP.md"
        ;;
        
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Next steps:"
echo "1. Restart VS Code"
echo "2. Test by asking Copilot: 'Get Mongoose documentation from Context7 MCP'"
echo "3. See docs/CONTEXT7_SETUP.md for troubleshooting"
echo "=========================================="
