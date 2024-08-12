import type { DocumentNode } from 'graphql/index';
import { print } from 'graphql/index';
import { LogicalOperator, getSdk } from './generated-shop';
import { getCookie, setCookie } from '../lib/cookieHelpers';
// import { AUTH_TOKEN, DEV_API, HEADER_AUTH_TOKEN_KEY, PROD_API } from '../graphql-types';

export const AUTH_TOKEN = 'authToken';
export const HEADER_AUTH_TOKEN_KEY = 'vendure-auth-token';

export type SortDirection = 'DESC' | 'ASC';
export interface RequesterOptions {
	// Vendure Channel code or token.
	channelToken?: string;
	// Auth bearer token
	token?: string;
	// The API URL to call. This can be the local shop API, dev shop API,
	// dev admin API, production shop API..etc.
	apiUrl?: string;
	take?: number;
	sort?: {
		updatedAt?: SortDirection;
		createdAt?: SortDirection;
		totalWithTax?: SortDirection;
		totalQuantity?: SortDirection;
	};
	skip?: number;
	filter?: { [name: string]: { [operator: string]: number | string } };
	filterOperator?: LogicalOperator;
}

type ResponseProps<T> = { token: string; data: T };
type ExecuteProps<V> = { query: string; variables?: V };
type Options = { method: string; headers: Record<string, string>; body: string };

const baseUrl = window.backend_url;
const shopApi = `${baseUrl}/shop-api`;

export const requester = async <R, V>(
	doc: DocumentNode,
	vars?: V,
	options: RequesterOptions = { token: '', apiUrl: shopApi, channelToken: '' }
): Promise<R> => {
	options.apiUrl = options?.apiUrl ?? shopApi;
	return execute<R, V>({ query: print(doc), variables: vars }, options);
};

const execute = async <R, V = Record<string, any>>(
	body: ExecuteProps<V>,
	options: RequesterOptions
): Promise<R> => {
	const requestOptions = {
		method: 'POST',
		headers: createHeaders(),
		body: JSON.stringify(body),
	};
	if (options.token) {
		requestOptions.headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${options.token ?? ''}`,
		};
	}
	if (options.channelToken) {
		requestOptions.headers['vendure-token'] = options.channelToken;
	}

	const response: ResponseProps<R> = await executeRequest(requestOptions, options.apiUrl!);

	// DELETE THIS
	// const response: ResponseProps<R> = await executeRequest(requestOptions, options.apiUrl!);

	if (response.token) {
		setCookie(AUTH_TOKEN, response.token, 365);
		// setCookie(ADMIN_AUTH_TOKEN, response.token, 365);
	}

	return response.data;
};

const createHeaders = () => {
  const token = getCookie(AUTH_TOKEN);
	let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
	return headers;
};

const executeRequest = async (options: Options, apiUrl: string) => {
	let httpResponse: Response = new Response();
	try {
		httpResponse = await fetch(apiUrl, options);
	} catch (error) {
		console.error(`Could not fetch from ${apiUrl}. Reason: ${error}`);
	}
	return await extractTokenAndData(httpResponse, apiUrl);
};

const extractTokenAndData = async (response: Response, apiUrl: string) => {
	if (response.body === null) {
		console.error(`Emtpy request body for a call to ${apiUrl}`);
		return { token: '', data: {} };
	}
	const token = response.headers.get(HEADER_AUTH_TOKEN_KEY) || '';
	const { data, errors } = await response.json();
	if (errors && !data) {
		// e.g. API access related errors, like auth issues.
		throw new Error(errors[0].message);
	}
	return { token, data };
};

export const shopSdk = getSdk(requester);
