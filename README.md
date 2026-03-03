# n8n-nodes-hubspot-custom

A custom n8n community node for HubSpot that supports **any OAuth2 scopes** — essential for working with custom objects, sensitive data, and enterprise HubSpot configurations.

## Why This Exists

The built-in n8n HubSpot node hardcodes OAuth scopes, which means you **cannot** use it if your HubSpot app requires:

- `crm.objects.custom.read` / `crm.objects.custom.write`
- `crm.schemas.custom.read` / `crm.schemas.custom.write`
- `crm.objects.custom.highly_sensitive.read.v2`
- `crm.objects.custom.sensitive.read.v2`
- `files`
- Or any other scopes not in n8n's default list

This node uses n8n's generic OAuth2 credential, which allows fully editable scopes. You control exactly what permissions your HubSpot connection requests.

## Installation

In your n8n instance:

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter: `n8n-nodes-hubspot-custom`
4. Confirm the install

The node will be available as **HubSpot Custom** in the node picker.

## Setup

### 1. Create a HubSpot App

1. Go to your [HubSpot Developer Account](https://app.hubspot.com/developer)
2. Create a new app (or use existing)
3. Under the **Auth** tab, configure:
   - **Redirect URL**: `https://your-n8n-domain.com/rest/oauth2-credential/callback`
   - **Scopes**: Add all scopes your workflows need
4. Note your **Client ID** and **Client Secret**

### 2. Create the OAuth2 Credential in n8n

This node uses the **Generic OAuth2 API** credential. When you first add the HubSpot Custom node to a workflow and click to create credentials, select **OAuth2 API** and configure:

| Field | Value |
|---|---|
| **Authorization URL** | `https://app.hubspot.com/oauth/authorize` |
| **Access Token URL** | `https://api.hubapi.com/oauth/v1/token` |
| **Client ID** | Your HubSpot app Client ID |
| **Client Secret** | Your HubSpot app Client Secret |
| **Scope** | Your scopes, space-separated (see below) |
| **Auth URI Query Parameters** | `grant_type=authorization_code` |
| **Authentication** | Body |

#### Example Scopes

For custom objects with sensitive data access:

```
oauth crm.objects.contacts.read crm.objects.contacts.write crm.objects.custom.read crm.objects.custom.write crm.schemas.custom.read crm.schemas.custom.write files crm.objects.custom.highly_sensitive.read.v2 crm.objects.contacts.read crm.objects.custom.sensitive.read.v2
```

The scopes in your n8n credential must **exactly match** the scopes configured in your HubSpot app.

After filling in the fields, click **Sign in with HubSpot** to authorize. Select the HubSpot portal you want to connect, and you're good to go.

## Node Operations

| Operation | Description |
|---|---|
| **Get** | Retrieve a single object by ID |
| **Get Many** | List objects with automatic pagination |
| **Search** | Query objects with HubSpot filters |
| **Create** | Create a new object |
| **Update** | Update an existing object |
| **Delete** | Remove an object |
| **Custom API Call** | Make any HubSpot API request |

### Object Type

Enter the HubSpot object type as a string. Standard objects: `contacts`, `companies`, `deals`, `tickets`, `products`, `line_items`, `quotes`.

For custom objects, use the **internal name** (not the display name). Find it in HubSpot under Settings → Data Management → Objects → Your Object → Details, or via the API: `GET /crm/v3/schemas`.

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

### Batch Update via Custom API Call

```
Operation: Custom API Call
HTTP Method: POST
Endpoint: /crm/v3/objects/your_custom_object/batch/update
Body: {"inputs": [{"id": "123", "properties": {"status": "updated"}}]}
```

## Troubleshooting

### "Scopes mismatch" error

The scopes in your n8n credential must exactly match the scopes configured in your HubSpot app. Copy them directly from your HubSpot app's Auth settings.

### "Insufficient scopes" error

Add the missing scope to both your HubSpot app configuration and your n8n credential, then reconnect.

### Token refresh issues

The credential uses n8n's built-in OAuth2 handling, so token refresh is automatic. If you're having issues, disconnect and reconnect the credential.

### Why generic OAuth2 instead of a custom credential?

n8n currently [does not support editable OAuth2 scopes in community node credentials](https://github.com/n8n-io/n8n/issues/23877). Only whitelisted first-party credentials (Google, Microsoft, generic OAuth2) can have user-editable scope fields. Using the generic OAuth2 credential is the workaround that gives you full control over scopes on any n8n instance without patching the source.

## Development

```bash
npm install
npm run dev    # Watch mode
npm run build  # Production build
npm run lint   # Lint
```

## License

MIT
