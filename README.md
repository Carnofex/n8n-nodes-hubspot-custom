# n8n-nodes-hubspot-custom

A custom n8n node for HubSpot that allows **configurable OAuth2 scopes** — essential for working with custom objects, sensitive data, and enterprise HubSpot configurations.

## Why This Exists

The built-in n8n HubSpot node hardcodes OAuth scopes, which means you **cannot** use it if your HubSpot app requires:

- `crm.objects.custom.read` / `crm.objects.custom.write`
- `crm.schemas.custom.read` / `crm.schemas.custom.write`  
- `crm.objects.custom.highly_sensitive.read.v2`
- `crm.objects.custom.sensitive.read.v2`
- Or any other scopes not in n8n's default list

This node solves that by letting you specify scopes in the credential configuration.

## Installation

### For Self-Hosted n8n (Docker/Kubernetes)

#### Option 1: npm install (recommended for production)

```bash
# If published to npm
npm install n8n-nodes-hubspot-custom

# Or install from git
npm install git+https://github.com/your-org/n8n-nodes-hubspot-custom.git
```

Then add to your n8n environment:

```bash
export N8N_CUSTOM_EXTENSIONS="/path/to/node_modules/n8n-nodes-hubspot-custom"
```

#### Option 2: Local development

```bash
# Clone this repo
git clone https://github.com/your-org/n8n-nodes-hubspot-custom.git
cd n8n-nodes-hubspot-custom

# Install dependencies
npm install

# Build
npm run build

# Link for local n8n development
npm link
cd ~/.n8n
npm link n8n-nodes-hubspot-custom
```

#### Option 3: Docker with custom nodes

In your Dockerfile:

```dockerfile
FROM n8nio/n8n:latest

USER root
RUN cd /usr/local/lib/node_modules/n8n && \
    npm install n8n-nodes-hubspot-custom
USER node
```

Or for Kubernetes, mount the built package as a volume to `/home/node/.n8n/custom`.

## Configuration

### 1. Create a HubSpot App

1. Go to your [HubSpot Developer Account](https://app.hubspot.com/developer)
2. Create a new app (or use existing)
3. Under **Auth** tab, configure:
   - **Redirect URL**: Your n8n OAuth callback URL (e.g., `https://your-n8n.com/rest/oauth2-credential/callback`)
   - **Scopes**: Add ALL scopes your workflows need

### 2. Create Credential in n8n

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **HubSpot Custom OAuth2 API**
3. Enter:
   - **Client ID**: From your HubSpot app
   - **Client Secret**: From your HubSpot app
   - **Scopes**: Space-separated list matching your HubSpot app exactly

Example scopes for custom objects:

```
oauth crm.objects.contacts.read crm.objects.contacts.write crm.objects.custom.read crm.objects.custom.write crm.schemas.custom.read crm.schemas.custom.write files crm.objects.custom.highly_sensitive.read.v2 crm.objects.custom.sensitive.read.v2
```

4. Click **Connect** to authorize

### 3. Use in Workflows

The node supports:

- **Get**: Retrieve a single object by ID
- **Get Many**: List objects with pagination
- **Search**: Query objects with filters
- **Create**: Create new objects
- **Update**: Update existing objects
- **Delete**: Remove objects
- **Custom API Call**: Make any HubSpot API request

## Usage Examples

### Get a Custom Object

```
Object Type: your_custom_object_name
Operation: Get
Object ID: 12345
Properties: property1,property2,property3
```

### Search Custom Objects

```
Object Type: your_custom_object_name  
Operation: Search
Filters (JSON): [{"propertyName": "status", "operator": "EQ", "value": "active"}]
Properties: name,status,created_at
Return All: true
```

### Update with Custom API Call

For complex operations, use Custom API Call:

```
Operation: Custom API Call
HTTP Method: POST
Endpoint: /crm/v3/objects/your_custom_object/batch/update
Body: {"inputs": [{"id": "123", "properties": {"status": "updated"}}]}
```

## Object Type Names

For standard objects:
- `contacts`
- `companies`
- `deals`
- `tickets`
- `products`
- `line_items`
- `quotes`

For custom objects, use the **internal name** (not display name):
- Check in HubSpot: Settings → Data Management → Objects → [Your Object] → Details
- Or via API: `GET /crm/v3/schemas`

## Troubleshooting

### "Scopes mismatch" error

The scopes in your n8n credential must **exactly match** the scopes configured in your HubSpot app. Copy them directly from HubSpot.

### "Insufficient scopes" error  

Add the missing scope to both:
1. Your HubSpot app configuration
2. Your n8n credential

### Token refresh issues

The credential extends n8n's built-in OAuth2, so token refresh should be automatic. If you're having issues, try disconnecting and reconnecting the credential.

## Development

```bash
# Watch mode for development
npm run dev

# Lint
npm run lint

# Build for production  
npm run build
```

## License

MIT
