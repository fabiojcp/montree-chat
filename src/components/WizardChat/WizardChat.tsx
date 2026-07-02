import { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import {
  fetchTypes,
  fetchTypeDetail,
  fetchPokemonDetail,
  type PokemonType,
  type PokemonDetail,
} from "../../api/pokemon";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A", fighting: "#C22E28", flying: "#A98FF3",
  poison: "#A33EA1", ground: "#E2BF65", rock: "#B6A136",
  bug: "#A6B91A", ghost: "#735797", steel: "#B7B7CE",
  fire: "#EE8130", water: "#6390F0", grass: "#7AC74C",
  electric: "#F7D02C", psychic: "#F95587", ice: "#96D9D6",
  dragon: "#6F35FC", dark: "#705746", fairy: "#D685AD",
};

const TYPE_NAMES_PT: Record<string, string> = {
  normal: "Normal", fighting: "Lutador", flying: "Voador",
  poison: "Veneno", ground: "Terrestre", rock: "Pedra",
  bug: "Inseto", ghost: "Fantasma", steel: "Aço",
  fire: "Fogo", water: "Água", grass: "Planta",
  electric: "Elétrico", psychic: "Psíquico", ice: "Gelo",
  dragon: "Dragão", dark: "Sombrio", fairy: "Fada",
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  background: #e8eaf6;
`;

const Bubble = styled.div<{ $sender: "system" | "user" }>`
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 6px;
  font-size: 14px;
  line-height: 1.45;
  align-self: ${({ $sender }) =>
    $sender === "user" ? "flex-end" : "flex-start"};
  background: ${({ $sender }) =>
    $sender === "user" ? "#e1ffc7" : "#fff"};
  color: #333;
  border-bottom-right-radius: ${({ $sender }) =>
    $sender === "user" ? "4px" : "12px"};
  border-bottom-left-radius: ${({ $sender }) =>
    $sender === "user" ? "12px" : "4px"};
`;

const OptionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  padding-left: 4px;
`;

const OptionChip = styled.button<{ $color?: string }>`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: ${({ $color }) => $color || "#4caf50"};
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;

  &:hover {
    transform: scale(1.06);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PokemonCard = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PokemonSprite = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
`;

const PokemonName = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #333;
  text-transform: capitalize;
`;

const PokemonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  padding-left: 4px;
`;

const DetailSprite = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
`;

const DetailName = styled.h3`
  font-size: 18px;
  color: #333;
  text-transform: capitalize;
  margin: 0;
`;

const PokedexId = styled.span`
  font-size: 13px;
  color: #999;
`;

const TypeBadge = styled.span<{ $color: string }>`
  padding: 3px 12px;
  border-radius: 12px;
  background: ${({ $color }) => $color};
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
`;

const ConfirmButton = styled.button`
  margin-top: 10px;
  padding: 10px 28px;
  border: none;
  border-radius: 20px;
  background: #4caf50;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #43a047;
  }
`;

const LoadingText = styled.span`
  font-size: 12px;
  color: #999;
  font-style: italic;
`;

const BottomRef = styled.div`
  height: 1px;
`;

const SIZE_RANGES = [
  { key: "small", label: "Pequeno (até 0.8m)", minH: 0, maxH: 8 },
  { key: "medium", label: "Médio (0.9m a 1.5m)", minH: 9, maxH: 15 },
  { key: "large", label: "Grande (acima de 1.6m)", minH: 16, maxH: 999 },
];

interface PokemonPreview {
  name: string;
  sprite: string | null;
}

interface PokemonPickerProps {
  onSelectPokemon: (pokemon: PokemonDetail) => void;
}

export default function WizardChat({ onSelectPokemon }: PokemonPickerProps) {
  const [types, setTypes] = useState<PokemonType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [pokemonList, setPokemonList] = useState<PokemonPreview[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"type" | "size" | "results" | "detail" | "done">("type");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [step, pokemonList, selectedPokemon, loading, scrollToBottom]);

  useEffect(() => {
    fetchTypes().then(setTypes).catch(() => {});
  }, []);

  const handleTypeClick = async (typeName: string) => {
    setSelectedType(typeName);
    setStep("size");
  };

  const handleSizeClick = async (sizeKey: string) => {
    setSelectedSize(sizeKey);
    setLoading(true);
    setStep("results");

    try {
      const range = SIZE_RANGES.find((r) => r.key === sizeKey)!;
      const typeDetail = await fetchTypeDetail(selectedType!);

      const mainPokemon = typeDetail.pokemon
        .filter((entry) => {
          const id = Number(
            entry.pokemon.url.split("/").filter(Boolean).pop(),
          );
          return id <= 1025;
        })
        .slice(0, 30);

      const details = await Promise.allSettled(
        mainPokemon.map((entry) => fetchPokemonDetail(entry.pokemon.name)),
      );

      const filtered: PokemonPreview[] = [];
      for (const result of details) {
        if (result.status === "fulfilled") {
          const p = result.value;
          if (p.height >= range.minH && p.height <= range.maxH) {
            filtered.push({
              name: p.name,
              sprite:
                p.sprites.other["official-artwork"].front_default ||
                p.sprites.front_default,
            });
          }
        }
      }

      setPokemonList(filtered);
    } catch {
      setPokemonList([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonClick = async (name: string) => {
    setLoading(true);
    try {
      const detail = await fetchPokemonDetail(name);
      setSelectedPokemon(detail);
      setStep("detail");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (selectedPokemon) {
      setStep("done");
      onSelectPokemon(selectedPokemon);
    }
  };

  const handleReset = () => {
    setSelectedType(null);
    setSelectedSize(null);
    setPokemonList([]);
    setSelectedPokemon(null);
    setStep("type");
  };

  return (
    <Container>
      {/* Step 1: Greeting + type selection */}
      <Bubble $sender="system">
        Olá! Vamos encontrar seu Pokémon ideal.
        <br />
        Primeiro: qual <strong>tipo</strong> você prefere?
      </Bubble>

      {step === "type" && (
        <OptionsRow>
          {types.map((t) => (
            <OptionChip
              key={t.name}
              $color={TYPE_COLORS[t.name] || "#888"}
              onClick={() => handleTypeClick(t.name)}
            >
              {TYPE_NAMES_PT[t.name] || t.name}
            </OptionChip>
          ))}
        </OptionsRow>
      )}

      {/* User's type choice */}
      {selectedType && (
        <Bubble $sender="user">
          {TYPE_NAMES_PT[selectedType] || selectedType}
        </Bubble>
      )}

      {/* Step 2: Size selection */}
      {step === "size" && selectedType && (
        <>
          <Bubble $sender="system">
            Ótimo! Tipo <strong>{TYPE_NAMES_PT[selectedType] || selectedType}</strong>{" "}
            é uma excelente escolha.
            <br />
            Agora, qual <strong>tamanho</strong> você prefere?
          </Bubble>

          <OptionsRow>
            {SIZE_RANGES.map((size) => (
              <OptionChip
                key={size.key}
                $color="#2196f3"
                onClick={() => handleSizeClick(size.key)}
              >
                {size.label}
              </OptionChip>
            ))}
          </OptionsRow>
        </>
      )}

      {/* User's size choice */}
      {selectedSize && (
        <Bubble $sender="user">
          {SIZE_RANGES.find((s) => s.key === selectedSize)?.label}
        </Bubble>
      )}

      {/* Step 3: Loading / Results */}
      {step === "results" && (
        <>
          <Bubble $sender="system">
            Buscando Pokémon do tipo{" "}
            <strong>{TYPE_NAMES_PT[selectedType!]}</strong> com esse tamanho...
            {loading && (
              <>
                {" "}
                <LoadingText>carregando...</LoadingText>
              </>
            )}
          </Bubble>

          {!loading && pokemonList.length > 0 && (
            <>
              <Bubble $sender="system">
                Encontrei {pokemonList.length} Pokémon! Escolha um:
              </Bubble>
              <PokemonGrid>
                {pokemonList.map((p) => (
                  <PokemonCard
                    key={p.name}
                    onClick={() => handlePokemonClick(p.name)}
                    disabled={loading}
                  >
                    {p.sprite ? (
                      <PokemonSprite src={p.sprite} alt={p.name} />
                    ) : (
                      <PokemonSprite
                        as="div"
                        style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "center", background: "#eee",
                          borderRadius: "50%", fontSize: 20,
                        }}
                      >
                        ?
                      </PokemonSprite>
                    )}
                    <PokemonName>{p.name}</PokemonName>
                  </PokemonCard>
                ))}
              </PokemonGrid>
            </>
          )}

          {!loading && pokemonList.length === 0 && (
            <Bubble $sender="system">
              Não encontrei Pokémon do tipo{" "}
              <strong>{TYPE_NAMES_PT[selectedType!]}</strong> com esse
              tamanho.{" "}
              <button
                onClick={handleReset}
                style={{
                  border: "none",
                  background: "none",
                  color: "#4caf50",
                  cursor: "pointer",
                  fontWeight: 700,
                  textDecoration: "underline",
                }}
              >
                Tentar de novo
              </button>
            </Bubble>
          )}
        </>
      )}

      {/* Step 4: Detail + confirm */}
      {step === "detail" && selectedPokemon && (
        <>
          <Bubble $sender="user">{selectedPokemon.name}</Bubble>

          <Bubble $sender="system">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <DetailSprite
                src={
                  selectedPokemon.sprites.other["official-artwork"]
                    .front_default ||
                  selectedPokemon.sprites.front_default ||
                  undefined
                }
                alt={selectedPokemon.name}
              />
              <PokedexId>
                #{String(selectedPokemon.id).padStart(3, "0")}
              </PokedexId>
              <DetailName>{selectedPokemon.name}</DetailName>
              <div style={{ display: "flex", gap: 6 }}>
                {selectedPokemon.types.map((t) => (
                  <TypeBadge
                    key={t.slot}
                    $color={TYPE_COLORS[t.type.name] || "#888"}
                  >
                    {TYPE_NAMES_PT[t.type.name] || t.type.name}
                  </TypeBadge>
                ))}
              </div>
              <ConfirmButton onClick={handleConfirm}>
                Escolher {selectedPokemon.name}!
              </ConfirmButton>
            </div>
          </Bubble>
        </>
      )}

      {step === "done" && selectedPokemon && (
        <Bubble $sender="system">
          <span style={{ fontSize: 16 }}>🎉</span>{" "}
          <strong>{selectedPokemon.name}</strong> foi escolhido!
          <br />
          Seu Pokémon está salvo. Volte ao chat para conversar!
        </Bubble>
      )}

      <BottomRef ref={bottomRef} />
    </Container>
  );
}
