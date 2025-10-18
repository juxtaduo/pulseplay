# Context7 MCP Server Configuration Guide

## What is Context7 MCP?

Context7 is a Model Context Protocol (MCP) server that provides access to up-to-date documentation for libraries and frameworks. It's used in this project to retrieve the latest documentation for:

- Mongoose (MongoDB ODM)
- Auth0 React SDK
- Gemini API (@google/generative-ai)
- Express and other Node.js packages

## Getting Your API Key

1. Visit [Context7.com](https://context7.com) or [Upstash Console](https://console.upstash.com)
2. Sign up or log in to your account
3. Generate a new API key (should start with `ctx7sk_`)
4. Copy the API key

## Configuration Methods

### Method 1: VS Code User Settings (Recommended)

This keeps your API key in VS Code's user settings, separate from the project repository.

1. Open VS Code Command Palette:
   - Windows/Linux: `Ctrl+Shift+P`
   - Mac: `Cmd+Shift+P`

2. Type and select: **"Preferences: Open User Settings (JSON)"**

3. Add this configuration to your settings JSON:

```json
{
  "mcp.servers": {
    "upstash_conte": {
      "env": {
        "CONTEXT7_API_KEY": "ctx7sk_your_actual_api_key_here"
      }
    }
  }
}
```

4. Save the file and restart VS Code

### Method 2: Environment Variable (Alternative)

If you prefer using environment variables:

1. Create a `.env` file in the project root (it's already in `.gitignore`):

```bash
CONTEXT7_API_KEY=ctx7sk_your_actual_api_key_here
```

2. Update your VS Code user settings to read from the environment:

```json
{
  "mcp.servers": {
    "upstash_conte": {
      "env": {
        "CONTEXT7_API_KEY": "${env:CONTEXT7_API_KEY}"
      }
    }
  }
}
```

### Method 3: Workspace Settings (Not Recommended)

⚠️ **Warning**: This method stores the key in `.vscode/settings.json`, which might be committed to git. Only use if you're sure the workspace settings are in `.gitignore`.

Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "upstash_conte": {
      "env": {
        "CONTEXT7_API_KEY": "ctx7sk_your_actual_api_key_here"
      }
    }
  }
}
```

## Verifying the Configuration

After configuring, you can test the MCP server by asking GitHub Copilot to:

```
Get the latest Mongoose documentation for schema validation
```

or

```
Check Context7 MCP for the latest @google/generative-ai API
```

The MCP tools should now work without authorization errors.

## Using Context7 in the Project

Once configured, you can use Context7 MCP to:

1. **Check latest package versions** before upgrading dependencies
2. **Get API documentation** for specific features (e.g., Mongoose TTL indexes)
3. **Verify breaking changes** when updating major versions
4. **Find code examples** from official documentation

Example usage in chat:

```
Use Context7 MCP to get the latest Auth0 React SDK documentation for PKCE flow
```

## Task T015 Completion

With the API key configured, you can now complete **T015** from Phase 2:

- [X] T015 Consult Context7 MCP for latest Mongoose, Gemini API, and Auth0 documentation

This will ensure you're using the most up-to-date API patterns and best practices.

## Troubleshooting

### "Unauthorized" Error
- Verify your API key starts with `ctx7sk_`
- Check for extra spaces or quotes in the configuration
- Restart VS Code after adding the configuration

### MCP Server Not Found
- Ensure the server name is exactly `upstash_conte` (underscore, not hyphen)
- Check that VS Code Copilot extension is up to date
- Try reloading the VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"

### Still Not Working?
- Check VS Code Output panel: View → Output → Select "MCP" or "GitHub Copilot"
- Verify the MCP server is running: Look for "upstash_conte" in the MCP servers list

---

**Note**: The Context7 MCP server is optional but highly recommended for keeping dependencies up to date. The project will work without it, but you won't have access to automated documentation lookup.
