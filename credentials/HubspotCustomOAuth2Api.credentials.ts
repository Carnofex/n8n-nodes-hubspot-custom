import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * HubSpot Custom OAuth2 API Credential
 * 
 * Unlike the built-in HubSpot credential, this allows you to specify
 * your own OAuth scopes - essential for custom objects, sensitive data,
 * and enterprise HubSpot configurations.
 */
export class HubspotCustomOAuth2Api implements ICredentialType {
  name = 'hubspotCustomOAuth2Api';

  displayName = 'HubSpot Custom OAuth2 API';

  documentationUrl = 'https://developers.hubspot.com/docs/api/oauth-quickstart-guide';

  extends = ['oAuth2Api'];

  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: 'https://app.hubspot.com/oauth/authorize',
      required: true,
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: 'https://api.hubapi.com/oauth/v1/token',
      required: true,
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: 'grant_type=authorization_code',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'body',
    },
    // ============================================================
    // THIS IS THE KEY DIFFERENCE - User-configurable scopes
    // ============================================================
    {
      displayName: 'Scopes',
      name: 'scope',
      type: 'string',
      default: 'oauth crm.objects.contacts.read crm.objects.contacts.write',
      required: true,
      description: 'Space-separated list of OAuth scopes. Must match your HubSpot app configuration exactly.',
      placeholder: 'oauth crm.objects.contacts.read crm.objects.custom.read ...',
      hint: 'Copy the scopes from your HubSpot app settings. Include all scopes your workflows need.',
    },
    {
      displayName: 'Developer API Key',
      name: 'apiKey',
      type: 'string',
      required: false,
      typeOptions: { password: true },
      default: '',
      description: 'Optional: Only needed for webhook subscriptions via the Developer API',
    },
    {
      displayName: 'App ID',
      name: 'appId',
      type: 'string',
      required: false,
      default: '',
      description: 'Optional: Your HubSpot app ID (for webhook subscriptions)',
    },
  ];
}
