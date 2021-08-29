import {HttpResponseBase} from '@angular/common/http';

export class HttpStatus {
  public static CONTINUE = new HttpStatus(100, 'Continue');
  public static SWITCHING_PROTOCOLS = new HttpStatus(101, 'Switching Protocols');
  public static PROCESSING = new HttpStatus(102, 'Processing');
  public static CHECKPOINT = new HttpStatus(103, 'Checkpoint');


  public static OK = new HttpStatus(200, 'OK');
  public static CREATED = new HttpStatus(201, 'Created');
  public static ACCEPTED = new HttpStatus(202, 'Accepted');
  public static NON_AUTHORITATIVE_INFORMATION = new HttpStatus(203, 'Non-Authoritative Information');
  public static NO_CONTENT = new HttpStatus(204, 'No Content');
  public static RESET_CONTENT = new HttpStatus(205, 'Reset Content');
  public static PARTIAL_CONTENT = new HttpStatus(206, 'Partial Content');
  public static MULTI_STATUS = new HttpStatus(207, 'Multi-Status');
  public static ALREADY_REPORTED = new HttpStatus(208, 'Already Reported');
  public static IM_USED = new HttpStatus(226, 'IM Used');

  public static MULTIPLE_CHOICES = new HttpStatus(300, 'Multiple Choices');
  public static MOVED_PERMANENTLY = new HttpStatus(301, 'Moved Permanently');
  public static FOUND = new HttpStatus(302, 'Found');
  public static SEE_OTHER = new HttpStatus(303, 'See Other');
  public static NOT_MODIFIED = new HttpStatus(304, 'Not Modified');
  public static TEMPORARY_REDIRECT = new HttpStatus(307, 'Temporary Redirect');
  public static PERMANENT_REDIRECT = new HttpStatus(308, 'Permanent Redirect');
  public static BAD_REQUEST = new HttpStatus(400, 'Bad Request');
  public static UNAUTHORIZED = new HttpStatus(401, 'Unauthorized');
  public static PAYMENT_REQUIRED = new HttpStatus(402, 'Payment Required');
  public static FORBIDDEN = new HttpStatus(403, 'Forbidden');
  public static NOT_FOUND = new HttpStatus(404, 'Not Found');
  public static METHOD_NOT_ALLOWED = new HttpStatus(405, 'Method Not Allowed');
  public static NOT_ACCEPTABLE = new HttpStatus(406, 'Not Acceptable');
  public static PROXY_AUTHENTICATION_REQUIRED = new HttpStatus(407, 'Proxy Authentication Required');
  public static REQUEST_TIMEOUT = new HttpStatus(408, 'Request Timeout');
  public static CONFLICT = new HttpStatus(409, 'Conflict');
  public static GONE = new HttpStatus(410, 'Gone');
  public static LENGTH_REQUIRED = new HttpStatus(411, 'Length Required');
  public static PRECONDITION_FAILED = new HttpStatus(412, 'Precondition Failed');
  public static PAYLOAD_TOO_LARGE = new HttpStatus(413, 'Payload Too Large');
  public static UNSUPPORTED_MEDIA_TYPE = new HttpStatus(415, 'Unsupported Media Type');
  public static REQUESTED_RANGE_NOT_SATISFIABLE = new HttpStatus(416, 'Requested range not satisfiable');
  public static EXPECTATION_FAILED = new HttpStatus(417, 'Expectation Failed');
  public static I_AM_A_TEAPOT = new HttpStatus(418, 'I\'m a teapot');
  public static UNPROCESSABLE_ENTITY = new HttpStatus(422, 'Unprocessable Entity');
  public static LOCKED = new HttpStatus(423, 'Locked');
  public static FAILED_DEPENDENCY = new HttpStatus(424, 'Failed Dependency');
  public static UPGRADE_REQUIRED = new HttpStatus(426, 'Upgrade Required');
  public static PRECONDITION_REQUIRED = new HttpStatus(428, 'Precondition Required');
  public static TOO_MANY_REQUESTS = new HttpStatus(429, 'Too Many Requests');
  public static REQUEST_HEADER_FIELDS_TOO_LARGE = new HttpStatus(431, 'Request Header Fields Too Large');
  public static UNAVAILABLE_FOR_LEGAL_REASONS = new HttpStatus(451, 'Unavailable For Legal Reasons');
  public static INTERNAL_SERVER_ERROR = new HttpStatus(500, 'Internal Server Error');
  public static NOT_IMPLEMENTED = new HttpStatus(501, 'Not Implemented');
  public static BAD_GATEWAY = new HttpStatus(502, 'Bad Gateway');
  public static SERVICE_UNAVAILABLE = new HttpStatus(503, 'Service Unavailable');
  public static GATEWAY_TIMEOUT = new HttpStatus(504, 'Gateway Timeout');
  public static HTTP_VERSION_NOT_SUPPORTED = new HttpStatus(505, 'HTTP Version not supported');
  public static VARIANT_ALSO_NEGOTIATES = new HttpStatus(506, 'Variant Also Negotiates');
  public static INSUFFICIENT_STORAGE = new HttpStatus(507, 'Insufficient Storage');
  public static LOOP_DETECTED = new HttpStatus(508, 'Loop Detected');
  public static BANDWIDTH_LIMIT_EXCEEDED = new HttpStatus(509, 'Bandwidth Limit Exceeded');
  public static NOT_EXTENDED = new HttpStatus(510, 'Not Extended');
  public static NETWORK_AUTHENTICATION_REQUIRED = new HttpStatus(511, 'Network Authentication Required');
  public static SERVER_NOT_START = new HttpStatus(0, 'the server is not starting');

  private static HTTP_STATUS = new Map<number, HttpStatus>();

  private static putHttpStatus(codeStatus: number, httpStatus: HttpStatus): void {
    if (!HttpStatus.HTTP_STATUS) {
      HttpStatus.HTTP_STATUS = new Map<number, HttpStatus>();
    }
    HttpStatus.HTTP_STATUS.set(codeStatus, httpStatus);
  }

  private constructor(public readonly codeStatus: number, public readonly messageStatus: string) {
    HttpStatus.putHttpStatus(codeStatus, this);
  }

  public static valueOf(httpResponse: HttpResponseBase): HttpStatus | undefined {
    return HttpStatus.HTTP_STATUS.get(httpResponse.status);
  }

  public equal(httpStatus: any): boolean {
    let isEqual = false;
    if (httpStatus) {
      if (httpStatus instanceof HttpStatus) {
        isEqual = this.codeStatus === httpStatus.codeStatus;
      } else if (typeof httpStatus === 'number') {
        isEqual = this.codeStatus === httpStatus;
      } else if (typeof httpStatus === 'string') {
        isEqual = this.messageStatus === httpStatus;
      }
    }
    return isEqual;
  }
}
