
export class ApiResponse<T = any> {
  result: number;
  message: string;
  value?: T;
  list?: T[];
  total?: number;

  private constructor(options: {
    result?: number;
    message?: string;
    value?: T;
    list?: T[];
    total?: number;
  }) {
    this.result = options.result ?? 0;
    this.message = options.message ?? 'Ok';
    this.value = options.value;
    this.list = options.list;
    this.total = options.list?.length || 0;
  }



  static item<T>(value: T, message: string = 'Ok'): ApiResponse<T> {
    return new ApiResponse<T>({ value, message, result: 0 });
  }

  static list<T>(list: T[], message: string = 'Ok'): ApiResponse<T> {
    return new ApiResponse<T>({ list, message, result: 0 });
  }

  static empty<T>(message: string = 'No records found'): ApiResponse<T> {
    return new ApiResponse<T>({ list: [], message, result: -1 });
  }

  static error(code: number = -1, message: string = 'Error'): ApiResponse {
    return new ApiResponse({ result: code, message });
  }

  isSuccess(): boolean {
    return this.result === 0 && this.value !== undefined;
  }

  isList(): boolean {
    return Array.isArray(this.list);
  }

  isItem(): boolean {
    return this.value !== undefined;
  }
}