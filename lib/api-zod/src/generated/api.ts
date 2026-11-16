import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import type {
  HealthStatus,
  TranscribeKeyboardAudioBody,
  TranscribeKeyboardAudioResponse,
  TranslateKeyboardTextBody,
  TranslateKeyboardTextResponse,
} from "./api.schemas";

import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

type RequestWithData<TData> = {
  data: TData;
} & Partial<RequestInit>;

export const getHealthCheckUrl = () => "/api/healthz";

export const healthCheck = async (
  options?: RequestInit,
): Promise<HealthStatus> => {
  return customFetch<HealthStatus>(getHealthCheckUrl(), {
    ...options,
    method: "GET",
  });
};

export const getHealthCheckQueryKey = () => [`/api/healthz`] as const;

export const getHealthCheckQueryOptions = <
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn: QueryFunction<Awaited<ReturnType<typeof healthCheck>>> = ({ signal }) =>
    healthCheck({ signal, ...requestOptions });

  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type HealthCheckQueryResult = NonNullable<
  Awaited<ReturnType<typeof healthCheck>>
>;
export type HealthCheckQueryError = ErrorType<unknown>;

export function useHealthCheck<
  TData = Awaited<ReturnType<typeof healthCheck>>,
  TError = ErrorType<unknown>,
>(options?: {
  query?: UseQueryOptions<
    Awaited<ReturnType<typeof healthCheck>>,
    TError,
    TData
  >;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };

  return { ...query, queryKey: queryOptions.queryKey };
}

export const getTranslateKeyboardTextUrl = () => "/api/keyboard/translate";

export const translateKeyboardText = async ({
  data,
  ...requestOptions
}: RequestWithData<TranslateKeyboardTextBody>): Promise<TranslateKeyboardTextResponse> => {
  return customFetch<TranslateKeyboardTextResponse>(getTranslateKeyboardTextUrl(), {
    ...requestOptions,
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getTranslateKeyboardTextMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    TranslateKeyboardTextResponse,
    TError,
    RequestWithData<TranslateKeyboardTextBody>,
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn = (variables: RequestWithData<TranslateKeyboardTextBody>) =>
    translateKeyboardText({ ...variables, ...requestOptions });

  return {
    mutationFn,
    ...mutationOptions,
  } as UseMutationOptions<
    TranslateKeyboardTextResponse,
    TError,
    RequestWithData<TranslateKeyboardTextBody>,
    TContext
  >;
};

export const useTranslateKeyboardText = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    TranslateKeyboardTextResponse,
    TError,
    RequestWithData<TranslateKeyboardTextBody>,
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  return useMutation(getTranslateKeyboardTextMutationOptions(options));
};

export const getTranscribeKeyboardAudioUrl = () => "/api/keyboard/transcribe";

export const transcribeKeyboardAudio = async ({
  data,
  ...requestOptions
}: RequestWithData<TranscribeKeyboardAudioBody>): Promise<TranscribeKeyboardAudioResponse> => {
  return customFetch<TranscribeKeyboardAudioResponse>(getTranscribeKeyboardAudioUrl(), {
    ...requestOptions,
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getTranscribeKeyboardAudioMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    TranscribeKeyboardAudioResponse,
    TError,
    RequestWithData<TranscribeKeyboardAudioBody>,
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};

  const mutationFn = (variables: RequestWithData<TranscribeKeyboardAudioBody>) =>
    transcribeKeyboardAudio({ ...variables, ...requestOptions });

  return {
    mutationFn,
    ...mutationOptions,
  } as UseMutationOptions<
    TranscribeKeyboardAudioResponse,
    TError,
    RequestWithData<TranscribeKeyboardAudioBody>,
    TContext
  >;
};

export const useTranscribeKeyboardAudio = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    TranscribeKeyboardAudioResponse,
    TError,
    RequestWithData<TranscribeKeyboardAudioBody>,
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  return useMutation(getTranscribeKeyboardAudioMutationOptions(options));
};
