export type Paginated<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};
