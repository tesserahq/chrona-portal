/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IEmbeddingModel {
  embed_model: string
  default_embed_dim: number
  available_dimensions: number[]
  max_tokens: number
  miracl_avg: number
  mteb_avg: number
  default: any
  hnsw_m: number
  hnsw_ef_search: number
  hnsw_dist_method: string
  hnsw_ef_construction: number
}

export interface IAvailableLlm {
  llm: string
  default: boolean
}

export interface ILlmProvider {
  name: string
  embedding_models: IEmbeddingModel[]
  available_llms: IAvailableLlm[]
}
