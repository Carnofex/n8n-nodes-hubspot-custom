import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IHttpRequestMethods,
  IHttpRequestOptions,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * HubSpot Custom Node
 * 
 * A flexible HubSpot node that works with custom OAuth2 scopes.
 * Supports standard objects, custom objects, and all HubSpot CRM v3 API operations.
 */
export class HubspotCustom implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'HubSpot Custom',
    name: 'hubspotCustom',
    icon: 'file:hubspot.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["objectType"]}}',
    description: 'HubSpot with custom OAuth2 scopes - supports custom objects',
    defaults: {
      name: 'HubSpot Custom',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'oAuth2Api',
        required: true,
      },
    ],
    properties: [
      // ------------------------------------------------------------------
      // Object Type
      // ------------------------------------------------------------------
      {
        displayName: 'Object Type',
        name: 'objectType',
        type: 'string',
        default: 'contacts',
        required: true,
        description: 'The HubSpot object type (contacts, companies, deals, or your custom object name)',
        placeholder: 'contacts',
      },
      // ------------------------------------------------------------------
      // Operation
      // ------------------------------------------------------------------
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new object',
            action: 'Create an object',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete an object',
            action: 'Delete an object',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get an object by ID',
            action: 'Get an object',
          },
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get multiple objects',
            action: 'Get many objects',
          },
          {
            name: 'Search',
            value: 'search',
            description: 'Search objects with filters',
            action: 'Search objects',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update an object',
            action: 'Update an object',
          },
          {
            name: 'Custom API Call',
            value: 'customApiCall',
            description: 'Make a custom API request',
            action: 'Make a custom API call',
          },
        ],
        default: 'get',
      },
      // ------------------------------------------------------------------
      // Object ID (for get, update, delete)
      // ------------------------------------------------------------------
      {
        displayName: 'Object ID',
        name: 'objectId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            operation: ['get', 'update', 'delete'],
          },
        },
        description: 'The ID of the object',
      },
      // ------------------------------------------------------------------
      // Properties to return
      // ------------------------------------------------------------------
      {
        displayName: 'Properties',
        name: 'properties',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['get', 'getAll', 'search'],
          },
        },
        description: 'Comma-separated list of properties to return',
        placeholder: 'firstname,lastname,email',
      },
      // ------------------------------------------------------------------
      // Associations
      // ------------------------------------------------------------------
      {
        displayName: 'Associations',
        name: 'associations',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['get', 'getAll', 'search'],
          },
        },
        description: 'Comma-separated list of associated objects to include',
        placeholder: 'deals,companies',
      },
      // ------------------------------------------------------------------
      // Limit
      // ------------------------------------------------------------------
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 100,
        displayOptions: {
          show: {
            operation: ['getAll', 'search'],
          },
        },
        description: 'Max number of results to return (max 100 per request)',
        typeOptions: {
          minValue: 1,
          maxValue: 100,
        },
      },
      // ------------------------------------------------------------------
      // Return All (pagination)
      // ------------------------------------------------------------------
      {
        displayName: 'Return All',
        name: 'returnAll',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: ['getAll', 'search'],
          },
        },
        description: 'Whether to return all results or only up to the limit',
      },
      // ------------------------------------------------------------------
      // Search Filters (JSON)
      // ------------------------------------------------------------------
      {
        displayName: 'Filters (JSON)',
        name: 'filters',
        type: 'json',
        default: '[]',
        displayOptions: {
          show: {
            operation: ['search'],
          },
        },
        description: 'HubSpot search filters as JSON array',
        placeholder: '[{"propertyName": "email", "operator": "EQ", "value": "test@example.com"}]',
      },
      // ------------------------------------------------------------------
      // Properties to Set (for create/update)
      // ------------------------------------------------------------------
      {
        displayName: 'Properties (JSON)',
        name: 'propertiesJson',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            operation: ['create', 'update'],
          },
        },
        description: 'Object properties as JSON',
        placeholder: '{"firstname": "John", "lastname": "Doe", "email": "john@example.com"}',
      },
      // ------------------------------------------------------------------
      // Custom API Call fields
      // ------------------------------------------------------------------
      {
        displayName: 'HTTP Method',
        name: 'httpMethod',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['customApiCall'],
          },
        },
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'DELETE', value: 'DELETE' },
        ],
        default: 'GET',
        description: 'HTTP method for the API call',
      },
      {
        displayName: 'Endpoint',
        name: 'endpoint',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['customApiCall'],
          },
        },
        required: true,
        description: 'API endpoint path (without base URL)',
        placeholder: '/crm/v3/objects/contacts',
      },
      {
        displayName: 'Query Parameters',
        name: 'queryParams',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            operation: ['customApiCall'],
          },
        },
        description: 'Query parameters as JSON object',
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'json',
        default: '{}',
        displayOptions: {
          show: {
            operation: ['customApiCall'],
            httpMethod: ['POST', 'PUT', 'PATCH'],
          },
        },
        description: 'Request body as JSON',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const operation = this.getNodeParameter('operation', 0) as string;
    const objectType = this.getNodeParameter('objectType', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        if (operation === 'get') {
          const objectId = this.getNodeParameter('objectId', i) as string;
          const properties = this.getNodeParameter('properties', i) as string;
          const associations = this.getNodeParameter('associations', i) as string;

          const qs: Record<string, string> = {};
          if (properties) qs.properties = properties;
          if (associations) qs.associations = associations;

          responseData = await hubspotApiRequest.call(
            this,
            'GET',
            `/crm/v3/objects/${objectType}/${objectId}`,
            {},
            qs,
          );

        } else if (operation === 'getAll') {
          const properties = this.getNodeParameter('properties', i) as string;
          const associations = this.getNodeParameter('associations', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const limit = this.getNodeParameter('limit', i) as number;

          const qs: Record<string, string | number> = { limit };
          if (properties) qs.properties = properties;
          if (associations) qs.associations = associations;

          if (returnAll) {
            responseData = await hubspotApiRequestAllItems.call(
              this,
              `/crm/v3/objects/${objectType}`,
              qs,
            );
          } else {
            const response = await hubspotApiRequest.call(
              this,
              'GET',
              `/crm/v3/objects/${objectType}`,
              {},
              qs,
            );
            responseData = response.results;
          }

        } else if (operation === 'search') {
          const properties = this.getNodeParameter('properties', i) as string;
          const filters = this.getNodeParameter('filters', i) as unknown as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const limit = this.getNodeParameter('limit', i) as number;

          const body: import('n8n-workflow').IDataObject = {
            limit,
            filterGroups: [{ filters: JSON.parse(filters) }],
          };
          if (properties) {
            body.properties = properties.split(',').map((p) => p.trim());
          }

          if (returnAll) {
            responseData = await hubspotSearchAllItems.call(
              this,
              `/crm/v3/objects/${objectType}/search`,
              body,
            );
          } else {
            const response = await hubspotApiRequest.call(
              this,
              'POST',
              `/crm/v3/objects/${objectType}/search`,
              body,
            );
            responseData = response.results;
          }

        } else if (operation === 'create') {
          const propertiesJson = this.getNodeParameter('propertiesJson', i) as string;
          const body = { properties: JSON.parse(propertiesJson) };

          responseData = await hubspotApiRequest.call(
            this,
            'POST',
            `/crm/v3/objects/${objectType}`,
            body,
          );

        } else if (operation === 'update') {
          const objectId = this.getNodeParameter('objectId', i) as string;
          const propertiesJson = this.getNodeParameter('propertiesJson', i) as string;
          const body = { properties: JSON.parse(propertiesJson) };

          responseData = await hubspotApiRequest.call(
            this,
            'PATCH',
            `/crm/v3/objects/${objectType}/${objectId}`,
            body,
          );

        } else if (operation === 'delete') {
          const objectId = this.getNodeParameter('objectId', i) as string;

          await hubspotApiRequest.call(
            this,
            'DELETE',
            `/crm/v3/objects/${objectType}/${objectId}`,
          );
          responseData = { success: true, deleted: objectId };

        } else if (operation === 'customApiCall') {
          const httpMethod = this.getNodeParameter('httpMethod', i) as IHttpRequestMethods;
          const endpoint = this.getNodeParameter('endpoint', i) as string;
          const queryParams = this.getNodeParameter('queryParams', i) as string;
          const qs = JSON.parse(queryParams);

          let body = {};
          if (['POST', 'PUT', 'PATCH'].includes(httpMethod)) {
            const bodyJson = this.getNodeParameter('body', i) as string;
            body = JSON.parse(bodyJson);
          }

          responseData = await hubspotApiRequest.call(
            this,
            httpMethod,
            endpoint,
            body,
            qs,
          );
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData as unknown as INodeExecutionData[]),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

// ------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------

async function hubspotApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
): Promise<Record<string, unknown>> {
  const credentials = await this.getCredentials('oAuth2Api');
  const token = credentials.oauthTokenData as { access_token: string };

  const options: IHttpRequestOptions = {
    method,
    url: `https://api.hubapi.com${endpoint}`,
    headers: {
      'Authorization': `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    qs,
    body,
    json: true,
  };

  if (Object.keys(body).length === 0) {
    delete options.body;
  }

  try {
    return await this.helpers.httpRequest(options);
  } catch (error) {
    throw new NodeOperationError(this.getNode(), error as Error);
  }
}

async function hubspotApiRequestAllItems(
  this: IExecuteFunctions,
  endpoint: string,
  qs: Record<string, unknown> = {},
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let after: string | undefined;

  do {
    const response = await hubspotApiRequest.call(
      this,
      'GET',
      endpoint,
      {},
      { ...qs, after },
    );

    results.push(...(response.results as Record<string, unknown>[]));
    after = (response.paging as { next?: { after?: string } })?.next?.after;
  } while (after);

  return results;
}

async function hubspotSearchAllItems(
  this: IExecuteFunctions,
  endpoint: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>[]> {
  const results: Record<string, unknown>[] = [];
  let after: string | undefined;

  do {
    const searchBody = { ...body, after };
    const response = await hubspotApiRequest.call(
      this,
      'POST',
      endpoint,
      searchBody,
    );

    results.push(...(response.results as Record<string, unknown>[]));
    after = (response.paging as { next?: { after?: string } })?.next?.after;
  } while (after);

  return results;
}
