export interface ApiResponseData<T> {
  data: T;
  message: string;
  success: boolean;
}
