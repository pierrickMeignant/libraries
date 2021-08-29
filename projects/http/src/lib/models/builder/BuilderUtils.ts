import {HttpOption} from '../request/http-option';
import {HttpHeaders, HttpParams} from '@angular/common/http';

function handleParams<T extends any>(defaultOption: HttpOption, option: HttpOption,
                                     keyParam: 'headers' | 'params' | 'reportProgress' |
                                       'responseType' | 'withCredentials', copy: (value: T) => T = value => value): T {
  return copy((option[keyParam] ? option[keyParam] : defaultOption[keyParam]) as T);
}

function extractValueHeaderByKey(key: string, header: HttpHeaders, headerCopy: HttpHeaders): HttpHeaders {
  let values: string | string[] | null = header.getAll(key);
  values = values ? values : header.get(key);
  if (values) {
    return headerCopy.set(key, values);
  }
  return headerCopy;
}

export function copyHeader(header?: HttpHeaders | { [header: string]: string | string[] }): HttpHeaders | undefined {
  if (!header) {
    return undefined;
  }
  let headerCopy = new HttpHeaders();
  if (header instanceof HttpHeaders) {
    header.keys().forEach(key => {
      headerCopy = extractValueHeaderByKey(key, header, headerCopy);
    });
  } else {
    headerCopy = new HttpHeaders(header);
  }
  return headerCopy;
}

export function copyParams(params?: HttpParams |  { [param: string]: string | string[] }): HttpParams | undefined {
  if (!params) {
    return undefined;
  }

  let paramsCopy = new HttpParams();
  if (params instanceof HttpParams) {
    params.keys().forEach(key => {
      let values: string | string[] | null = params.getAll(key);
      values = values ? values : params.get(key);
      if (values) {
        if (Array.isArray(values)) {
          values.forEach(value => paramsCopy = paramsCopy.append(key, value));
        } else {
          paramsCopy = paramsCopy.set(key, values);
        }
      }
    });
  } else {
    paramsCopy = paramsCopy.appendAll(params);
  }
  return paramsCopy;
}

export function copyOption(option?: HttpOption): HttpOption | undefined {
  if (!option) {
    return undefined;
  }
  const optionCopy: HttpOption = {};
  optionCopy.params = copyParams(option.params);
  optionCopy.headers = copyHeader(option.headers);
  optionCopy.withCredentials = option.withCredentials;
  optionCopy.responseType = option.responseType;
  optionCopy.reportProgress = option.reportProgress;
  return optionCopy;
}

export function mergeUrl(url: string, name: string, addName: boolean, completeUrl: string[]): string {
  let urlMerge = url + (addName ? `/${name}` : '');
  completeUrl.forEach(value => urlMerge += `/${value}`);
  return urlMerge;
}

export function mergeOption(defaultOption?: HttpOption, option?: HttpOption): HttpOption | undefined {
  let options: HttpOption | undefined = undefined;
  if (defaultOption && option) {
    options = {};
    options.params = handleParams(defaultOption, option, 'params', value => copyParams(value));
    options.headers = mergeHeaders(defaultOption.headers, option.headers);
    options.reportProgress = handleParams(defaultOption, option, 'reportProgress');
    options.responseType = handleParams(defaultOption, option, 'responseType');
    options.withCredentials = handleParams(defaultOption, option, 'withCredentials');
  } else if (defaultOption) {
    options = copyOption(defaultOption);
  } else if (option) {
    options = copyOption(option);
  }
  return options;
}

export function mergeHeaders(defaultHeaders: HttpHeaders | { [header: string]: string | string[]; } | undefined,
                      headers: HttpHeaders | { [header: string]: string | string[]; } | undefined): HttpHeaders | undefined {
  if (!defaultHeaders && !headers) {
    return undefined;
  }
  let header = new HttpHeaders();
  const isHttpHeaders = defaultHeaders instanceof HttpHeaders;
  const getHeader = (header1?: HttpHeaders) => {
    if (header1) {
      header = header1;
    }
    return header;
  }
  extractOnHeaderAndGetKeysNotInsertedToDefault(header1 => getHeader(header1), defaultHeaders, headers)
    .forEach(key => insertOnHeader(key, isHttpHeaders, defaultHeaders!, header1 => getHeader(header1)));
  return header;
}

function extractKeys(headers: HttpHeaders | { [header: string]: string | string[]; } | undefined): string[] {
  let keys: string[] = [];
  if (headers) {
    if (headers instanceof HttpHeaders) {
      keys = headers.keys();
    } else {
      keys = Object.keys(headers);
    }
  }
  return keys;
}

function extractOnHeaderAndGetKeysNotInsertedToDefault(header: (header?: HttpHeaders) => HttpHeaders,
                         defaultHeaders?: HttpHeaders | { [header: string]: string | string[]; },
                         headers?: HttpHeaders | { [header: string]: string | string[]; }): string[] {
  const defaultKeys = extractKeys(defaultHeaders);
  const isHttpHeaders = headers instanceof HttpHeaders;
  extractKeys(headers).forEach(key => {
    const indexKeyRemove = defaultKeys.indexOf(key);
    if (indexKeyRemove > -1) {
      defaultKeys.splice(indexKeyRemove, 1);
    }
    insertOnHeader(key, isHttpHeaders, headers!, header)
  });
  return defaultKeys;
}

function insertOnHeader(key: string, isHttpHeader: boolean, headers: HttpHeaders | {[header: string]: string | string[]},
                        header: (header?: HttpHeaders) => HttpHeaders ): void {
  if (isHttpHeader) {
    header(extractValueHeaderByKey(key, headers as HttpHeaders, header()));
  } else {
    header(header().set(key, (headers as { [header: string]: string | string[]; })[key]));
  }
}

