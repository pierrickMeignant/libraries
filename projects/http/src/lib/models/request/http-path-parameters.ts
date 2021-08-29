export class HttpPathParameters {
  public readonly keys = [] as string[];
  public readonly values: {value: any, converter: (value: any) => string}[] = [];

  private constructor() {
  }

  public append<T>(key: string, value: T, converter: (value: T) => string = value1 => (value1 as {toString: () => string}).toString()): HttpPathParameters  {
    this.keys.push(key);
    this.values.push({value, converter});
    return this;
  }

  public appendAll(keys: string[], values:{ value: any, converter?: (value: any) => string}[]): HttpPathParameters  {
    let index = 0;
    if (keys.length !== values.length) {
      return this;
    }
    for (const key of keys) {
      const value = values[index++];
      this.append(key, value.value, value.converter);
    }
    return this;
  }

  public appendParameters(pathParameters: HttpPathParameters): HttpPathParameters {
    return this.appendAll(pathParameters.keys, pathParameters.values);
  }

  public appendAllParameters(pathParameters: HttpPathParameters[]): HttpPathParameters {
    pathParameters.forEach(pathParameter => this.appendParameters(pathParameter));
    return this;
  }

  public get(key: string): string {
    const index = this.keys.indexOf(key);
    let value = ':' + key;
    if (index !== -1) {
      const valueWithConverter = this.values[index];
      value = valueWithConverter.converter(valueWithConverter.value);
    }
    return value;
  }

  public get isValid(): boolean {
    return this.keys.length === this.values.length;
  }

  public static builder<T>(key?: string, value?: T, converter?: (value: T) => string): HttpPathParameters {
    let pathParameters = new HttpPathParameters();
    if (key && value) {
      pathParameters = pathParameters.append(key, value, converter);
    }
    return pathParameters;
  }

  public static create<T>(keys: string[], values:{ value: any, converter?: (value: any) => string}[]): HttpPathParameters {
    return new HttpPathParameters().appendAll(keys, values);
  }

  public static byMap(pathParameters: Map<string, any>): HttpPathParameters {
    let parameters = new HttpPathParameters();
    for (const parameter of pathParameters.entries()) {
      parameters = parameters.append(parameter[0], parameter[1]);
    }
    return parameters;
  }
}
