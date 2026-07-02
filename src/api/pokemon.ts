import axios from "axios";

const pokeApi = axios.create({
  baseURL: "https://pokeapi.co/api/v2",
  timeout: 10000,
});

export interface PokemonType {
  name: string;
  url: string;
}

export interface TypePokemonEntry {
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}

export interface TypeDetail {
  id: number;
  name: string;
  pokemon: TypePokemonEntry[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
}

export async function fetchTypes(): Promise<PokemonType[]> {
  const { data } = await pokeApi.get<{
    results: PokemonType[];
  }>("/type?limit=18");
  return data.results;
}

export async function fetchTypeDetail(name: string): Promise<TypeDetail> {
  const { data } = await pokeApi.get<TypeDetail>(`/type/${name}`);
  return data;
}

export async function fetchPokemonDetail(name: string): Promise<PokemonDetail> {
  const { data } = await pokeApi.get<PokemonDetail>(`/pokemon/${name}`);
  return data;
}
