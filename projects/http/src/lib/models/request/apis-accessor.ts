import {EndpointsAccessor} from './endpoints-accessor';

export interface ApisAccessor extends EndpointsAccessor {
  getApi(apiName: string): ApisAccessor | undefined;
  get apisName(): string[];
  hasApi(apiName: string): boolean;
}
